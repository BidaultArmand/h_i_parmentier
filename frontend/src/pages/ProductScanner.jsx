import { useCallback, useEffect, useRef, useState } from 'react';
import { scanProduct } from '../services/scannerClient';

const INITIAL_RESULT = {
  barcode: null,
  score: null,
  product: null,
};

function formatGrade(grade) {
  switch (grade) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Bon';
    case 'average':
      return 'Moyen';
    default:
      return 'Faible';
  }
}

export default function ProductScanner() {
  const videoRef = useRef(null);
  const [barcode, setBarcode] = useState('');
  const [autoScan, setAutoScan] = useState(false);
  const [result, setResult] = useState(INITIAL_RESULT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectorSupported, setDetectorSupported] = useState(false);

  // Vérifier si BarcodeDetector est dispo (Chrome, Edge...)
  useEffect(() => {
    setDetectorSupported('BarcodeDetector' in window);
  }, []);

  // Boucle de détection auto via caméra
  useEffect(() => {
    if (!autoScan || !detectorSupported) {
      return undefined;
    }

    let active = true;
    let stream;
    let raf;
    const detector = new window.BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code'],
    });

    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        detectLoop();
      } catch (err) {
        console.error('Camera init failed', err);
        setError(
          'Impossible d’accéder à la caméra. Autorisez la caméra ou entrez le code manuellement.'
        );
        setAutoScan(false);
      }
    }

    async function detectLoop() {
      if (!active || !videoRef.current) return;
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes.length > 0) {
          const detected = codes[0].rawValue;
          setBarcode(detected);
          setAutoScan(false);
          await handleScan(detected);
          return;
        }
      } catch (err) {
        console.warn('Detection error', err);
      }
      raf = requestAnimationFrame(detectLoop);
    }

    initCamera();

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoScan, detectorSupported]);

  const handleScan = useCallback(async (value) => {
    if (!value) return;
    setLoading(true);
    setError('');
    try {
      const payload = await scanProduct(value);
      setResult({
        barcode: payload.barcode,
        product: payload.product,
        score: payload.score,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur lors du scan');
      setResult(INITIAL_RESULT);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!barcode) return;
    await handleScan(barcode);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-emerald-500 font-semibold">
          Scanner intelligent
        </p>
        <h1 className="text-3xl font-bold">Analyse nutritionnelle instantanée</h1>
        <p className="text-muted-foreground">
          Scannez un code-barres ou saisissez-le pour obtenir un score
          nutritionnel, des alertes additifs et des recommandations en temps réel.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {/* Formulaire code-barres */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 border rounded-xl bg-white/50 shadow-sm"
        >
          <label className="block text-sm font-medium">
            Code-barres
            <input
              className="mt-2 w-full rounded-lg border px-3 py-2 text-lg tracking-widest"
              placeholder="Ex: 3274080005003"
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-600 disabled:bg-gray-300"
            disabled={loading || !barcode}
          >
            {loading ? 'Analyse...' : 'Analyser'}
          </button>

          {detectorSupported && (
            <button
              type="button"
              onClick={() => setAutoScan((value) => !value)}
              className="w-full rounded-lg border px-4 py-2 font-semibold hover:border-emerald-400"
            >
              {autoScan ? 'Arrêter le scan auto' : 'Scanner via la caméra'}
            </button>
          )}

          {!detectorSupported && (
            <p className="text-sm text-orange-600">
              Votre navigateur ne supporte pas encore la lecture automatique
              (BarcodeDetector). Utilisez l’entrée manuelle.
            </p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        {/* Prévisualisation caméra */}
        <div className="rounded-xl border bg-black/90 p-4 text-white">
          <video ref={videoRef} className="w-full rounded-lg" muted playsInline />
          <p className="mt-2 text-sm text-gray-300">
            Dirigez le code-barres vers la caméra arrière. La détection s’arrête
            automatiquement dès qu’un produit est trouvé.
          </p>
        </div>
      </section>

      {/* Résultat du scan */}
      {result?.product && result?.score && (
        <section className="rounded-2xl border bg-white/70 p-6 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {result.product.imageUrl && (
                <img
                  src={result.product.imageUrl}
                  alt={result.product.name || 'Produit'}
                  className="h-20 w-20 rounded-xl object-cover border shadow-sm"
                />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Produit scanné</p>
                <h2 className="text-2xl font-semibold">
                  {result.product.name || 'Produit inconnu'}
                </h2>
                <p className="text-sm text-gray-500">{result.product.brands}</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Score global</p>
              <p className="text-4xl font-black text-emerald-500">
                {result.score.total}
              </p>
              <p className="uppercase text-xs tracking-widest">
                {formatGrade(result.score.grade)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Bloc Nutrition */}
            <div className="rounded-xl bg-emerald-50 p-4">
              <h3 className="font-semibold">Nutrition</h3>
              <p className="text-sm text-gray-600">
                Score {Math.round(result.score.breakdown.nutrition.score)} / 100
              </p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>
                  Fibres: +{result.score.breakdown.nutrition.details.fiberPoints} pts
                </li>
                <li>
                  Protéines: +
                  {result.score.breakdown.nutrition.details.proteinPoints} pts
                </li>
                <li>
                  Sucres: -
                  {result.score.breakdown.nutrition.details.sugarPoints} pts
                </li>
                <li>
                  Graisses saturées: -
                  {result.score.breakdown.nutrition.details.satFatPoints} pts
                </li>
              </ul>
            </div>

            {/* Bloc Additifs & Allergènes */}
            <div className="rounded-xl bg-red-50 p-4">
              <h3 className="font-semibold">Additifs & Allergènes</h3>

              {/* Additifs */}
              <p className="text-sm text-gray-600">
                Additifs :{' '}
                {result.score.breakdown.additives.riskyAdditives.length} détectés →{' '}
                {result.score.breakdown.additives.penalty} pts
              </p>

              {result.score.breakdown.additives.riskyAdditives.length === 0 ? (
                <p className="text-sm text-gray-600 mt-2">
                  Aucun additif signalé ✅
                </p>
              ) : (
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  {result.score.breakdown.additives.riskyAdditives
                    .slice(0, 5)
                    .map((additive) => (
                      <li key={additive.tag}>
                        {additive.tag.replace('en:', '').toUpperCase()}
                      </li>
                    ))}
                </ul>
              )}

              {/* Allergènes */}
              {result.score.breakdown.allergenPenalty < 0 && (
                <p className="text-sm text-red-600 mt-3">
                  Allergènes : présents →{' '}
                  {result.score.breakdown.allergenPenalty} pts
                </p>
              )}

              {/* Total pénalités */}
              <p className="text-sm font-medium mt-3 text-red-600">
                Total des pénalités :{' '}
                {result.score.breakdown.additives.penalty +
                  result.score.breakdown.allergenPenalty}{' '}
                pts
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

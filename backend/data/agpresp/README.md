# 📁 Dossier des Résultats AGP

Ce dossier contient les résultats des recherches effectuées par l'agent AGP sur La Vie Claire.

## 📄 Types de Fichiers

### 1. Fichier Global
**Format :** `recherche_YYYY-MM-DDTHH-MM-SS.txt`

Contient tous les résultats de la recherche dans un seul fichier, organisé par produit.

**Exemple :** `recherche_2025-11-14T14-30-45.txt`

### 2. Fichiers par Produit
**Format :** `nom_produit_YYYY-MM-DDTHH-MM-SS.txt`

Un fichier par ingrédient recherché, avec les détails spécifiques.

**Exemples :**
- `quinoa_2025-11-14T14-30-45.txt`
- `huile_d_olive_2025-11-14T14-30-45.txt`
- `legumes_de_saison_2025-11-14T14-30-45.txt`

## 📋 Contenu des Fichiers

Chaque fichier contient :
- ✅ Nom du produit
- ✅ Quantité demandée
- ✅ Catégorie
- ✅ Recette d'origine
- ✅ Task ID (pour consulter sur Surfer-H)
- ✅ Résultats détaillés avec jusqu'à 4 références :
  - Prix
  - Nutriscore
  - Label bio
  - Origine
  - Marque
  - Conditionnement

## 🔄 Génération Automatique

Les fichiers sont automatiquement générés lorsque vous appelez :

```bash
POST http://localhost:5001/api/agp/search-from-json
```

## 📊 Organisation

Les fichiers sont organisés par timestamp pour faciliter le suivi :
- Les recherches récentes apparaissent en premier
- Chaque recherche a un timestamp unique
- Les fichiers individuels partagent le même timestamp que le fichier global

## 🗑️ Gestion des Fichiers

Les fichiers `.txt` ne sont pas suivis par Git (voir `.gitignore`).

Pour nettoyer les anciens résultats :

```bash
# Supprimer tous les fichiers de résultats
rm backend/data/agpresp/*.txt

# Ou supprimer les fichiers de plus de 7 jours
find backend/data/agpresp -name "*.txt" -mtime +7 -delete
```

## 💡 Utilisation

1. Lancez une recherche via l'API
2. Attendez la complétion
3. Les fichiers seront automatiquement créés dans ce dossier
4. Consultez le fichier global pour une vue d'ensemble
5. Consultez les fichiers individuels pour des détails par produit

## 🔗 Liens Utiles

- **Surfer-H :** https://surfer.h-company.ai (pour voir les screenshots)
- **Documentation :** Voir `RECHERCHE_LAVIECLAIRE_README.md` à la racine du projet

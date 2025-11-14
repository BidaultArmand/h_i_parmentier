# 🔐 Configuration du Token NPM

## ⚠️ Important

Le fichier `.npmrc` contient votre token d'authentification npm et **NE DOIT JAMAIS** être commité dans Git.

---

## 📋 Configuration Initiale

### 1. Copier le Template

```bash
cp .npmrc.example .npmrc
```

### 2. Obtenir Votre Token NPM

1. Visitez **Portal-H** ou votre registre npm
2. Générez un token d'authentification
3. Copiez le token

### 3. Configurer le Token

Ouvrez `.npmrc` et remplacez `YOUR_NPM_TOKEN_HERE` par votre vrai token :

```
@h-company:registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ Vérification

Le fichier `.npmrc` :
- ✅ Est listé dans `.gitignore`
- ✅ Ne sera PAS commité dans Git
- ✅ Reste uniquement sur votre machine locale

---

## 🚨 Sécurité

Si vous avez accidentellement commité un token :

1. **Révoquez immédiatement le token** sur Portal-H ou npm
2. Générez un nouveau token
3. Mettez à jour votre `.npmrc` local
4. Le fichier est maintenant dans `.gitignore` et ne sera plus commité

---

## 👥 Pour l'Équipe

Chaque membre de l'équipe doit :

1. Cloner le repo
2. Copier `.npmrc.example` vers `.npmrc`
3. Ajouter son propre token npm
4. Ne jamais commit `.npmrc`

---

## 📚 Plus d'Informations

- Documentation npm : https://docs.npmjs.com/about-authentication-tokens
- Portal-H : https://portal.h-company.ai

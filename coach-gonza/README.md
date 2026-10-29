# Coach Gonza (BoxCoach)

App para el Coach Gonzalo Palma Oviedo: turnos, clientes, paquetes, ingresos, combates, rutinas y **noticias de boxeo en castellano**.
Se instala en el iPhone (o Android) desde el navegador, sin App Store y sin costo.

---

## Publicarla gratis con GitHub Pages (recomendado: las noticias se actualizan solas)

1. Creá una cuenta gratis en https://github.com (si no tenés).
2. Arriba a la derecha: **+ → New repository**. Nombre: `coach-gonza`. Dejalo en **Public** y tocá **Create repository**.
3. En la página del repositorio nuevo tocá **uploading an existing file**, arrastrá **todo el contenido** de esta carpeta (incluida la carpeta oculta `.github`) y tocá **Commit changes**.
   - Si la carpeta `.github` no se ve en tu compu: en Mac apretá `Cmd + Shift + .`; en Windows, en el Explorador activá *Vista → Elementos ocultos*.
4. En el repositorio: **Settings → Pages → Source: GitHub Actions**.
5. Andá a la pestaña **Actions**, elegí **Publicar Coach Gonza** y tocá **Run workflow**. En 1 o 2 minutos queda online.
6. La dirección va a ser: `https://TU-USUARIO.github.io/coach-gonza/`

Después de eso, cada 3 horas GitHub busca noticias nuevas y vuelve a publicar la app solo.

## Opción rápida sin GitHub (Netlify Drop)

Entrá a https://app.netlify.com/drop y arrastrá la carpeta `dist` (la que viene en el zip "lista-para-subir").
La app funciona completa, pero las noticias quedan fijas (no se renuevan solas). Creá una cuenta gratis de Netlify para que el link no se borre.

---

## Instalarla en el iPhone de Gonza

1. Abrir el link en **Safari** (tiene que ser Safari).
2. Tocar el botón **Compartir** (el cuadrado con la flecha hacia arriba).
3. Elegir **Agregar a inicio** → **Agregar**.
4. Queda el ícono del guante "Coach Gonza" en la pantalla de inicio. Se abre a pantalla completa y funciona sin internet (menos las noticias).

En Android: abrir el link en Chrome → menú ⋮ → **Instalar app**.

## Importante sobre los datos

- Todo se guarda **solo en ese teléfono** (privado, sin servidores).
- Si se borra la app del inicio o se borran los datos de Safari, se pierde todo. Por eso conviene, cada tanto:
  **Más → Ajustes → Guardar copia de seguridad** y mandarla a WhatsApp, Drive o Archivos.
- Para pasar los datos a otro teléfono: **Restaurar desde una copia**.
- La app arranca vacía. En Ajustes se pueden **cargar datos de ejemplo** para probarla, y después **borrar todo y empezar de cero**.

---

## Para desarrollar (opcional)

```bash
npm install
npm run dev      # vista previa en http://localhost:3000
npm run news     # baja noticias nuevas a public/news.json
npm run build    # genera la carpeta dist
```

Las noticias salen de Google Noticias (búsquedas de boxeo en español, Argentina). Se configuran en `scripts/fetch-news.mjs`.

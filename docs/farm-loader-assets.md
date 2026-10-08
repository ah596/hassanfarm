# Farm grazing loader assets

## Current PNG animation

The current loader uses the two original PNG files supplied by the user, copied without modifying their image data:

- `frontend/public/loading/animal.png`
- `frontend/public/loading/grass.png`

The cow bends its head toward the grass, chews, and gently shifts its body. The grass sways around its base. SVG layers keep the head and jaw connected; the illustration remains still when reduced motion is requested. Existing Farm request handling controls when the loader appears.

## Earlier illustrated version

The previous assets below were generated with the built-in Imagegen tool from the user's earlier grazing cow illustration. They are retained as earlier artwork and are no longer rendered by the loader. Browser canvas encoding converted them to WebP for delivery.

Earlier assets:

- `frontend/public/loading/grazing-cow-v2.webp`
- `frontend/public/loading/pasture-v2.webp`

## Cow generation prompt

Use the attached cow meadow illustration as a STYLE AND CHARACTER REFERENCE. Create one production-ready transparent raster illustration of JUST the grazing cow for a Farm app loading animation. Match the reference's warm softly hand-painted storybook appearance, soft brown pencil contours, cream-white Holstein cow with organically shaped gray/brown patches, natural friendly proportions, pink nose and udder, small tan horns, a little golden bell at the throat. Entire cow visible from hooves to ears and tail. Side three-quarter view, cow facing LEFT, lowered head actively eating, muzzle near hoof level, relaxed expression. Cow body occupies the center-right and its lowered head the lower-left. All four legs visible. Tail curves outward to the RIGHT away from the hindquarters with a dark soft tuft. Keep legs clearly separated and neck/head readable for animation. Beautiful gentle textured shading; visually match the user reference, not geometric vector art. No pasture, no grass, no shadow, no sky, no text, no frame, no decorative marks, no extra animals. Genuine transparent alpha background. Wide landscape 3:2 canvas with generous clear margins all around the entire silhouette.

## Cow cutout refinement prompt

Edit this cow cutout. Change ONLY the background alpha: remove the entire brown/gray halo, vignette, glow, soft shadow and any painted background around and between the legs. Every pixel outside the cow's actual brown outline must be fully transparent, including the gap under the belly and the spaces between legs. Keep the exact cow itself, its painted details, proportions, positions, grazing pose, horns, bell, udder and tail unchanged. Preserve 1536 x 1024 canvas and original subject placement. A clean production transparent PNG cutout with crisp softly antialiased silhouette; absolutely no aura or drop shadow.

## Meadow generation prompt

Use the attached grazing cow illustration as a STYLE REFERENCE. Create JUST the empty pastoral farm meadow background plate for the same Farm app loading animation. Warm hand-painted storybook watercolor and softly colored pencil style, matching the user reference. Wide landscape 16:9 composition: pale blue sky with softly rounded creamy clouds, rolling light-green hills and distant bushes, a small red barn and silo on the far LEFT, a winding ocher path near the left barn, lush green foreground meadow with tiny warm yellow flowers. A level clear grass area across the central foreground for a grazing cow to be added later. Grass blades visible in foreground, soft cheerful daylight, muted organic colors. No cow, no animals, no people, no text, no UI, no frames. Beautiful natural detailed illustration; not a geometric flat vector.

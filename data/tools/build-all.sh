#!/usr/bin/env bash
# Rebuild canonical/ from the sources. Run from data-pool/. Requires bun and uv.
set -euo pipefail
# Use a uv-managed Python: system interpreters can make uv scan unreadable dirs such as /usr/local/bin.
export UV_PYTHON_PREFERENCE="${UV_PYTHON_PREFERENCE:-only-managed}" UV_PYTHON="${UV_PYTHON:-3.12}"
S=sources; C=$S/ocha-cod-ab-cmr/extracted/geojson; T=derived/location-script-2025-07/snapshot
mkdir -p build
uv run -q --with pymupdf python -I tools/extract_bucrep_layout.py $S/bucrep-rgph2005-repertoire-villages/raw/loc.pdf build/bucrep-layout.json
bun tools/parse-bucrep.ts $T/loc.txt patches/bucrep-loc-txt.json build/bucrep-parsed.json decisions/bucrep-moves.json
bun tools/compare-extractions.ts build/bucrep-parsed.json build/bucrep-layout.json | grep differences
bun tools/match-bucrep-codab.ts build/bucrep-parsed.json $C crosswalks/bucrep-codab.json build/bucrep-codab-match.json
bun tools/match-elecam-codab.ts $S/elecam-polling-stations-2025/raw/elecam_data.csv $C crosswalks/elecam-codab.json build/elecam-codab-match.json
bun tools/spatial-match-geoboundaries.ts $S/geoboundaries-cmr-gbopen/raw/pristine-9469f09/geoBoundaries-CMR-ADM3.geojson $C/cmr_admin3.geojson build/geoboundaries-codab-spatial.json
bun tools/build-canonical.ts
bun tools/validate-canonical.ts

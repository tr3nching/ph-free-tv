# ph-free-tv

Playlist of free, publicly listed Philippine streams (from iptv-org). Every 6 hours it checks each stream manifest and publishes only the ones that respond.

- `build.mjs`: downloads the list, checks streams, writes `dist/free.m3u` and `report.txt`.
- Guide: points at the `ph-epg` guide; most of these channels have no listings.

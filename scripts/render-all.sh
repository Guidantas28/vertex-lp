#!/bin/bash
set -e
DIR="/private/tmp/claude-501/-Users-victorsouza-master-os/d6ff4b66-24a4-435e-aa3e-e2c50b4988c8/scratchpad/video"
LP="/Users/victorsouza/landing-page-vertex"
BASE="https://d8j0ntlcm91z4.cloudfront.net/user_3FDtPkZ7XHquIQgCfeVHHz10y2g"
cd "$DIR"

ENCV="-c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p -r 30 -vsync cfr -x264-params keyint=60:min-keyint=60:scenecut=0"
ENCA="-c:a aac -b:a 192k"

compose () { # L W M T OUT NOFADEOUT
  local L=$1 W=$2 M=$3 T=$4 OUT=$5 NF=$6
  local OUTT FO; OUTT=$(echo "$T + 0.5"|bc); FO=$(echo "$T - 0.3"|bc)
  local VF="scale=3840:2160:flags=lanczos,fps=30,fade=t=in:st=0:d=0.3"
  if [ -z "$NF" ]; then VF="$VF,fade=t=out:st=$FO:d=0.4"; fi
  ffmpeg -y -ss "$L" -i "$W" -i "$M" -t "$OUTT" -map 0:v:0 -map 1:a:0 \
    -vf "$VF" -af "atempo=1.2,adelay=150|150,afade=t=out:st=$FO:d=0.35" \
    $ENCV $ENCA -movflags +faststart "$OUT" 2>/dev/null
}
rec () { local O; O=$(cd "$LP" && SCENE="$1" SCENE_T="$2" node scripts/record-kinetic.mjs 2>/dev/null); echo "$(echo "$O"|sed -n 's/.*"lead":\([0-9.]*\).*/\1/p')|$(echo "$O"|sed -n 's/.*"video":"\([^"]*\)".*/\1/p')"; }

echo "=== welcome ==="
curl -sL "$BASE/hf_20260628_042008_f9f47c45-d211-4d31-9d92-6b863799081a.mp3" -o n-welcome.mp3
R=$(rec "s01-welcome.html" 5.4); compose "${R%%|*}" "${R##*|}" n-welcome.mp3 5.4 scene-welcome.mp4

SCENES="
conecta|hf_20260628_131704_a713c57d-458d-42d7-90c7-93062929083b.mp3|8.9
produtos|hf_20260628_131708_61085831-7c54-432f-9ef4-cf2c6861760e.mp3|9.7
servicos|hf_20260628_131954_3b39fdf7-162a-4d48-b0de-5f7dda2ecb4d.mp3|7.7
cresce|hf_20260628_131958_4ab2f3c4-4467-4c09-956d-02490a7852a1.mp3|7.9
crm|hf_20260628_131737_f9a892c9-43af-4131-889c-346119ec4421.mp3|8.2
cascata|hf_20260628_140118_a2db8ec5-d699-42b4-95d3-f36ab4794add.mp3|15.4
dashboard|hf_20260628_131853_58f992b7-826c-4bac-81b0-92e379737c6b.mp3|10.1
ia|hf_20260628_131858_2c60c0ba-e19e-4b5a-b6f3-13cc4d2723bd.mp3|8.5
modular|hf_20260628_131902_1a152947-1ce7-4c50-b106-0401e60ced51.mp3|8.7
beneficios|hf_20260628_131908_c3e65b69-481f-4529-bd5f-ff9ea9dfd3d8.mp3|12.3
fecho|hf_20260628_131912_36debce0-51c2-4153-976c-efe3655df41e.mp3|5.5
"
for line in $SCENES; do
  id=$(echo "$line"|cut -d'|' -f1); mp3=$(echo "$line"|cut -d'|' -f2); T=$(echo "$line"|cut -d'|' -f3)
  echo "=== $id (T=$T) ==="
  curl -sL "$BASE/$mp3" -o "n-$id.mp3"
  R=$(rec "vos-scene.html?s=$id&t=$T" "$T")
  NF=""; [ "$id" = "fecho" ] && NF=1
  compose "${R%%|*}" "${R##*|}" "n-$id.mp3" "$T" "scene-$id.mp4" "$NF"
  echo "  ok"
done

# concat (uniforme -> copy liso, sem re-encode)
{ echo "file 'scene-welcome.mp4'"; for line in $SCENES; do id=$(echo "$line"|cut -d'|' -f1); echo "file 'scene-$id.mp4'"; done; } > concat-full.txt
ffmpeg -y -f concat -safe 0 -i concat-full.txt -c copy VOS-video-full-4k.mp4 2>/dev/null
ffmpeg -y -i VOS-video-full-4k.mp4 -vf "scale=1920:1080:flags=lanczos" -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -movflags +faststart VOS-video-full-1080p.mp4 2>/dev/null
cp VOS-video-full-4k.mp4 ~/Desktop/VOS-video-full-4k.mp4
cp VOS-video-full-1080p.mp4 ~/Desktop/VOS-video-full-1080p.mp4
echo "=== PRONTO ==="; ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 VOS-video-full-4k.mp4; ls -la VOS-video-full-4k.mp4|awk '{print $5}'
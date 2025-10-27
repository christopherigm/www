#!/bin/bash

# Supervisor
# sudo apt -y install supervisor

# sudo vim /etc/supervisor/conf.d/ip-camera-shot.conf

# [program:ip_camera]
# directory=/home/christopher/
# command=/bin/bash ip-camera-shot.sh
# autostart=true
# autorestart=true
# stderr_logfile=/var/log/long.err.log
# stdout_logfile=/var/log/long.out.log

# Restart Server
# sudo supervisorctl reread && \
# sudo supervisorctl update && \
# sudo supervisorctl restart ip_camera

# Logs
# cat /var/log/long.out.log
# sudo rm /var/log/long.err.log && sudo touch /var/log/long.err.log
# sudo rm /var/log/long.out.log && sudo touch /var/log/long.out.log

force=false;
sunrise=6;
sunset=21;
sleep_time=10;
remote_path="/shared-volume/time-lapse";

webcam='webcam';
night_cam='night_cam';
kitchen='kitchen';

if [[ "$1" == "--force" ]]; then
  force=true;
fi
# echo "force: $force";

while true; do
  current_hour=`date "+%H"`;
  current_hour=`expr $current_hour + 0`;
  
  date=$(date '+%Y-%m-%d %H-%M-%S');
  photo_time=`date "+%m/%d/%Y - %H\:%M"`;

  fontfile="fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
  fontcolor="fontcolor=white";
  fontsize="fontsize=50"
  textbox="box=1:boxcolor=black@0.5:boxborderw=20"
  text1="drawtext=$fontfile:text='$photo_time':$fontcolor:$fontsize:$textbox:x=(w-text_w)-50:y=(h-text_h)-50"
  text2="drawtext=$fontfile:text='Longmont CO':$fontcolor:$fontsize:$textbox:x=50:y=(h-text_h)-50"

  ## Daylight Camera
  if [[ $current_hour -ge $sunrise && $current_hour -le $sunset ]] || $force ; then
    picture="$date.jpg";
    final_picture="picture $picture";

    rm -f "photoaf.jpg";
    wget --user="admin" \
      --password="aline7474" \
      "http://www.iguzman.com.mx:27474/photoaf.jpg" \
      --no-verbose;
    mv "photoaf.jpg" "$picture";

    ffmpeg -i "$picture" \
      -loglevel quiet \
      -vf "$text1,$text2" \
      -y "$final_picture";
    rm "$picture";

    cp "$final_picture" "$remote_path/$webcam";
    rm "$final_picture";
  fi

  ## Night camera
  if [[ $current_hour -ge || && $current_hour -le 6 ]] || $force ; then
    picture="$date.jpg";
    final_picture="picture $picture";

    rm -f "snapshot.cgi";
    wget --user="admin" \
      --password="aline7474" \
      "http://192.168.0.40/cgi-bin/snapshot.cgi" \
      --no-verbose;
    mv "snapshot.cgi" "$picture";

    ffmpeg -i "$picture" \
      -loglevel quiet \
      -vf "$text1,$text2" \
      -y "$final_picture";
    rm "$picture";

    cp "$final_picture" "$remote_path/$night_cam";
    rm "$final_picture";
  fi

  ## Kitchen camera
  if [[ $current_hour -ge 23 || $current_hour -le 6 ]] || $force ; then
    picture="$date.jpg";
    final_picture="picture $picture";

    rm -f "snapshot.cgi";
    wget --user="admin" \
      --password="aline7474" \
      "http://192.168.0.39/cgi-bin/snapshot.cgi" \
      --no-verbose;
    mv "snapshot.cgi" "$picture";

    ffmpeg -i "$picture" \
      -loglevel quiet \
      -vf "$text1,$text2" \
      -y "$final_picture";
    rm "$picture";

    cp "$final_picture" "$remote_path/$kitchen";
    rm "$final_picture";
  fi

  sleep $sleep_time
done

exit 0
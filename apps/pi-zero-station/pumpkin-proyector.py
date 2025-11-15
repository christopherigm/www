#!/usr/bin/env python3
from gpiozero import DistanceSensor
from time import sleep
import vlc

# https://docs.sunfounder.com/projects/umsk/en/latest/05_raspberry_pi/pi_lesson23_ultrasonic.html

class Player:
    is_interacting = False
    instance = None
    player = None
    sensor = None
    video_id = 1

    def __init__(self):
        self.instance = vlc.Instance()
        self.player = self.instance.media_player_new()

    def start(self):
        media = self.instance.media_new("/home/christopher/buffer.mp4")
        self.player.set_media(media)
        self.player.play()
        self.sensor = DistanceSensor(echo=27, trigger=17)

        try:
            while True:
                # Measure distance and convert from meters to centimeters
                dis = self.sensor.distance * 100
                # Print the distance with two decimal precision
                if int(dis) < 99 and self.is_interacting == False:
                    print('Distance: {:.2f} cm'.format(dis))
                    if self.video_id == 6:
                        self.video_id = 1
                    self.is_interacting = True
                    media = self.instance.media_new(f"/home/christopher/{self.video_id}.mp4")
                    self.video_id = self.video_id + 1
                    self.player.set_media(media)
                    self.player.play()

                # print('EV:', self.player.get_state())
                if str(self.player.get_state()) == "State.Ended":
                    self.is_interacting = False
                    media = self.instance.media_new("/home/christopher/buffer.mp4")
                    self.player.set_media(media)
                    self.player.play()
                sleep(0.1)
        except KeyboardInterrupt:
            # Handle KeyboardInterrupt (Ctrl+C)
            # to gracefully exit the loop
            pass

player = Player()
player.start()

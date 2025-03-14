import board
from adafruit_pca9685 import PCA9685
import pigpio

class Manage():

    def __init__(self):
        self.i2c = board.I2C()
        self.pca = PCA9685(self.i2c)
        self.pca.frequency = 50
        self.ESC=10 # change to actual pils connects 
        
        self.pi = pigpio.pi()
        if not self.pi.connected:
            print("error")
            exit()
    
    def mapper(self, x: int, in_min: int, in_max: int, out_min: int, out_max: int)->int:
        return (x - in_min) * (out_max - out_min) // (in_max - in_min) + out_min


    def moving_servo(self, angle: int):
        angle_after = hex(self.mapper(angle, 0, 180, 0, 0xFFFF))
        self.pca.channels[0].duty_cycle = angle_after


    def moving_go(self, speed: int):
        # давать значения будем назад (от -500 до 0), вперед также от 0 до 500
        speeding = 0
        if speed<0:
            speeding = self.mapper(abs(speed), 0, 500, 1500, 500)
        else:
            speeding = self.mapper(speed, 0, 500, 1500, 2500)
        self.pi.set_servo_pulsewidth(self.ESC, speeding)
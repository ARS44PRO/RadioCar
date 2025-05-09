from board import SCL,SDA
from adafruit_pca9685 import PCA9685
from adafruit_motor import servo
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn


class Manage():

    def __init__(self):
        self.i2c = busio.I2C(SCL,SDA)
        self.pca = PCA9685(self.i2c)
        self.pca.frequency = 50
        self.my_servo = servo.Servo(self.pca.channels[0])
        self.esc = servo.Servo(self.pca.channels[1],min_pulse=1000,max_pulse=2000)
        self.ads = ADS.ADS1115(self.i2c)
    
    def mapper(self, x: int, in_min: int, in_max: int, out_min: int, out_max: int)->int:
        return (x - in_min) * (out_max - out_min) // (in_max - in_min) + out_min

    def moving_servo(self,angle: int):
        self.my_servo.angle = angle


    def moving_go(self, speed: int):
        # давать значения будем назад (от -255 до 0), вперед также от 0 до 255
        speeding = 0
        if speed<0:
            speeding = self.mapper(abs(speed), 0, 255, 90, 0)
        else:
            speeding = self.mapper(speed, 0, 255, 90, 180)
        self.esc.angle = speeding


    def get_volt(self)->float:
        return AnalogIn(self.ads, ADS.P0).voltage
    
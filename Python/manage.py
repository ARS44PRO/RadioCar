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
        self.esc = self.pca.channels[1]
        self.ads = ADS.ADS1115(self.i2c)
    
    def mapper(self, x: int, in_min: int, in_max: int, out_min: int, out_max: int)->int:
        return (x - in_min) * (out_max - out_min) // (in_max - in_min) + out_min

    def moving_servo(self,angle: int):
        self.my_servo.angle = angle

    def pwm_us_to_duty(self, us):
        pwm_period = 1000000 / 50  
        duty = int(us / pwm_period * 65535)
        return max(0, min(65535, duty))

    def moving_go(self, speed: int):
        # Значения от -255 (назад) до +255 (вперёд)
        if speed < 0:
            pwm_us = self.mapper(abs(speed), 0, 255, 1500, 1000)  # Назад
        elif speed > 0:
            pwm_us = self.mapper(speed, 0, 255, 1500, 2000)       # Вперёд
        else:
            pwm_us = 1500  # Стоп
        self.esc_channel.duty_cycle = self.pwm_us_to_duty(pwm_us)


    def get_volt(self)->float:
        return AnalogIn(self.ads, ADS.P0).voltage
    
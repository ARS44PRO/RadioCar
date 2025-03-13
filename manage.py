import board
from adafruit_pca9685 import PCA9685
import pigpio

def mapper(x: int, in_min: int, in_max: int, out_min: int, out_max: int)->int:
    return (x - in_min) * (out_max - out_min) // (in_max - in_min) + out_min

def init():
    i2c = board.I2C()
    pca = PCA9685(i2c)
    pca.frequency = 50
    ESC=10 # change to actual pils connects 
    
    pi = pigpio.pi()
    if not pi.connected:
        print("error")
        exit()

def moving_servo(angle: int):
    angle_after = hex(mapper(angle, 0, 180, 0, 0xFFFF))
    pca.channels[0].duty_cycle = angle_after


def moving_go(speed: int):
    # давать значения будем назад (от -500 до 0), вперед также от 0 до 500
    speeding = 0
    if speed<0:
        speeding = mapper(abs(speed), 0, 500, 1500, 500)
    else:
        speeding = mapper(speed, 0, 500, 1500, 2500)
    pi.set_servo_pulsewidth(ESC, speeding)
import time
from board import SCL, SDA
import busio
from adafruit_pca9685 import PCA9685
from adafruit_motor import servo

# Создаем I2C шину
i2c = busio.I2C(SCL, SDA)

# Инициализация PCA9685
pca = PCA9685(i2c)
pca.frequency = 50

# Подключаем сервопривод на 0-м канале
my_servo = servo.Servo(pca.channels[0])

# Двигаем сервопривод
while True:
    my_servo.angle = 0
    time.sleep(1)
    my_servo.angle = 90
    time.sleep(1)
    my_servo.angle = 180
    time.sleep(1)
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
esc = servo.Servo(pca.channels[1],min_pulse=1000,max_pulse=2000)
# Двигаем сервопривод
while True:
    my_servo.angle = 0
    esc.angle = 90
    print(0)
    time.sleep(2)
    my_servo.angle = 30
    esc.angle = 70
    print(30)
    time.sleep(2)
    my_servo.angle = 150
    esc.angle = 110
    print(150)
    time.sleep(2)
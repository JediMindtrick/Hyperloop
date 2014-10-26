Hyperloop
=========
System for Event Sourcing + Realtime model push experiment


Here's how you install zeromq, before doing npm install zmq:
```
wget http://download.zeromq.org/zeromq-4.0.5.tar.gz
tar -xvzf zeromq-4.0.5.tar.gz
mv zeromq-4.0.5.tar.gz zeromq
cd zeromq
sudo apt-get install libtool pkg-config build-essential autoconf automake uuid-dev
./configure
sudo make install
sudo ldconfig
```

Set HYPERLOOP_ENV environment variable for config to pick up.

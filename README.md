# Icy Tower

Türkçe arayüzlü, bağımlılıksız Canvas platform oyunu. İvmeli hareket, hızla güçlenen zıplama, sonsuz platformlar, yükselen kamera, yerel rekor, ses ve dokunmatik kontroller içerir.

## Çalıştırma

Python 3 ve Node.js 18+ gerekir. Paket kurulumu veya gizli anahtar gerekmez.

```sh
cd /workspace/icytower
npm start
```

Sunucu 8000 portunda çalışır. Ok tuşları veya A/D ile hareket et, Space ile zıpla, P ile duraklat. Basılı Space her inişte yeniden zıplatır. Altıncı saniyeden sonra kamera kendiliğinden yükselir; ekranın altında kalan oyuncu kaybeder. Rekor tarayıcıda saklanır.

```sh
npm test
```

Testler platform çarpışması, zıplama, momentum, duvarlar, kamera, platform üretimi ve düşerek kaybetmeyi doğrular.

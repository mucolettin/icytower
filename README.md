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

## Yeni mekanikler

- **Roket (↑):** 1,6 saniye otomatik yükseliş; geçilen katlar da puan kazandırır.
- **Süper zıplama (↟):** 8 saniye boyunca %30 daha güçlü zıplama.
- **Zaman freni (◷):** 6 saniye boyunca otomatik kamera baskısını %75 azaltır.
- **Kurtarma kalkanı (◇):** Bir düşüşte oyuncuyu roketle tekrar kuleye taşır.
- Her 6 katta bir güçlendirme çıkar; türler sırayla gelir. Toplamak 250 bonus puan verir.
- Turuncu platformlar inişten 0,65 saniye sonra kırılır; mor platformlar oyuncuyu taşıyarak yatay hareket eder.
- Her 20 katta hareket ve kamera temposu yükselir. Zıplama yüksekliği korunur; hareket temposu 1,65 katla sınırlıdır.
- 3 saniye içinde yeni katlara ardışık inişler kombo verir; kat atlayarak iniş ekstra puan kazandırır.

Sonraki sürüm fikirleri: günlük sabit tohumlu kule, hayalet rekor koşusu, karakter kostümleri ve görevlerle açılan kule temaları.

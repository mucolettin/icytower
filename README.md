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

- **Roket (↑):** 0,65 saniye sınırlı yükseliş; bitince hız yumuşatılır. Geçilen katlar da puan kazandırır. Yeni roket için platforma iniş ve 5 saniyelik bekleme gerekir. Boost uçuşu ve kalkan kurtarması sırasında diğer güçlendirmeler toplanamaz.
- **Süper zıplama (↟):** 8 saniye boyunca %30 daha güçlü zıplama.
- **Zaman freni (◷):** 6 saniye boyunca otomatik kamera baskısını %75 azaltır.
- **Kurtarma kalkanı (◇):** Bir düşüşte oyuncuyu roketle tekrar kuleye taşır.
- İlk güçlendirme 6–10. kat arasında çıkar; sonraki güçlendirmeler 14–22 kat aralıklarla, rastgele türde ve sağlam platformlarda üretilir. Toplamak 250 bonus puan verir.
- Turuncu platformlar inişten 0,65 saniye sonra kırılır; mor platformlar oyuncuyu taşıyarak yatay hareket eder.
- Her 20 katta hareket ve kamera temposu yükselir. Zıplama yüksekliği korunur; hareket temposu 1,65 katla sınırlıdır.
- 3 saniye içinde yeni katlara ardışık inişler kombo verir; kat atlayarak iniş ekstra puan kazandırır.

Sonraki sürüm fikirleri: günlük sabit tohumlu kule, hayalet rekor koşusu, karakter kostümleri ve görevlerle açılan kule temaları.

## Sonsuz rastgele seviye tasarımı

Platformlar sabit bir rota dizisini tekrar etmez. Her yeni platformun konumu, genişliği, aralığı ve türü önceki platformdan türetilir. Görsel temalar 20 katta bir değişmeye devam eder: Buz Avlusu, Kristal Galeri, Saat Kulesi ve Fırtına Zirvesi.

- Kat aralıkları 64–82 piksel, normal platform genişlikleri 120–185 piksel arasındadır. İlk dört kat daha geniş ve yakın platformlarla başlar.
- Platform merkezleri önceki merkezden en fazla 50 piksel uzaklaşır. Hareketli platformların iki yöndeki 24 piksellik hareketi için de pay bırakılır.
- Kırılan veya hareketli bir platformun ardından mutlaka sağlam ya da mola platformu gelir. Güçlendirmeler tehlikeli platformlara yerleştirilmez.
- Mola katları 18–24 katlık rastgele aralıklarla oluşur: 360 piksel genişlik, ilk inişte 300 bonus puan ve 3 saniyelik otomatik kamera molası. Yeniden doğma noktası değildir.
- Otomatik kamera baskısı 90 piksel/saniye ile sınırlıdır; yüksek katlarda sınırsız hızlanarak oyunu imkansız hale getirmez.

`levels.js` üretim kurallarını içerir. Testler farklı rastgele dizilerde platform sınırlarını, farklı hareket zamanlarında toplam 1.200 geçişin güçlendirmesiz gerçek fizikle erişilebilirliğini, mola katlarını ve boost zincirinin engellenmesini doğrular. Erişilebilirlik testleri her geçişi ayrı sınar; oyuncunun her koşuyu tamamlayacağını garanti etmez.

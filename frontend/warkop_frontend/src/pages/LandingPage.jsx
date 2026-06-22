import React, { useState, useEffect } from 'react';
import '../css/landing-style.css';

const menuData = [
    {
        category: 'Kopi Panas',
        filter: 'kopi',
        items: [
        { name: 'Kopi Hitam', price: 'Rp 5.000', fav: false },
        { name: 'Kopi Susu', price: 'Rp 8.000', fav: true },
        { name: 'Kopi Jahe', price: 'Rp 7.000', fav: false },
        { name: 'Kopi Aren', price: 'Rp 10.000', fav: true },
        ]
    },
    {
        category: 'Es Kopi',
        filter: 'kopi',
        items: [
        { name: 'Es Kopi Susu', price: 'Rp 12.000', fav: true },
        { name: 'Es Kopi Aren', price: 'Rp 14.000', fav: true },
        { name: 'Es Americano', price: 'Rp 10.000', fav: false },
        { name: 'Es Kopi Gula Batu', price: 'Rp 11.000', fav: false },
        ]
    },
    {
        category: 'Non-Kopi',
        filter: 'nonkopi',
        items: [
        { name: 'Teh Tarik', price: 'Rp 8.000', fav: false },
        { name: 'Es Teh Manis', price: 'Rp 5.000', fav: false },
        { name: 'Susu Cokelat', price: 'Rp 10.000', fav: true },
        { name: 'Wedang Jahe', price: 'Rp 7.000', fav: false },
        ]
    },
    {
        category: 'Makanan',
        filter: 'makanan',
        isFood: true,
        items: [
        { name: 'Indomie Rebus', price: 'Rp 8.000', fav: false },
        { name: 'Indomie Goreng Spesial', price: 'Rp 10.000', fav: true },
        { name: 'Nasi Goreng Kampung', price: 'Rp 15.000', fav: true },
        { name: 'Roti Bakar Cokelat', price: 'Rp 10.000', fav: false },
        ]
    },
    {
        category: 'Cemilan',
        filter: 'makanan',
        isFood: true,
        items: [
        { name: 'Pisang Goreng', price: 'Rp 7.000', fav: false },
        { name: 'Tahu Crispy', price: 'Rp 8.000', fav: true },
        { name: 'Singkong Goreng', price: 'Rp 6.000', fav: false },
        { name: 'Tempe Mendoan', price: 'Rp 7.000', fav: false },
        ]
    }
];

const testiData = [
    { name: 'Basuki.', meta: 'Pelanggan Tetap · Mahasiswa', stars: 5, text: 'Kopi susu arennya enak banget dan harganya masuk akal. Tempatnya juga nyaman banget buat nugas berlama-lama. Udah jadi langganan sejak semester satu.' },
    { name: 'Aguss.', meta: 'Pelanggan · Freelancer', stars: 5, text: 'Suka banget sama suasananya deh kayak tenang tapi nggak sepi. WiFi nya stabil, colokan ada di mana-mana. Kalau lagi kerja remote asik nih gak perlu berebut colokan.' },
    { name: 'Yudhis.', meta: 'Pelanggan · Karyawan Swasta', stars: 4, text: 'Nasi gorengnya kacau enak banget porsinya banyak gak pelit HAHAHA dan rasanya selalu konsisten. Nongkrong sama teman-teman kantor sini jadi pilihan rutin setiap minggu.' },
    { name: 'Ahmad.', meta: 'Pelanggan · Pelajar SMA', stars: 5, text: 'Harganya ramah di kantong pelajar, tapi kualitasnya nggak murahan. Es kopi susunya favorit banget, selalu repeat order tiap hari.' },
    { name: 'Billy.', meta: 'Pelanggan · Wiraswasta', stars: 4, text: 'Tempatnya enak buat meeting informal. Karyawannya ramah dan gerak cepat. Minumannya beragam pilihan, semua yang pernah saya coba enak.' },
    { name: 'Dewi.', meta: 'Pelanggan · Ibu Rumah Tangga', stars: 5, text: 'Teh tariknya mengingatkan saya dengan warung di kampung halaman. Roti bakarnya juga nagih. cocok nih buat ngobrol santai sambil menikmati sore.' }
];

const heroSlides = [
    { img: '/img/warkop-profile2.jpg' },
    { img: '/img/warkop-profile3.jpg' },
    { img: '/img/warkop-profile4.jpg' }
];

export default function LandingPage({ onNavigate }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [menuFilter, setMenuFilter] = useState('all');
    const [testiPage, setTestiPage] = useState(0);
    const [timeStr, setTimeStr] = useState('00:00:00');
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const TESTI_PER_PAGE = 3;

    useEffect(() => {
        const slideTimer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(slideTimer);
    }, []);

    useEffect(() => {
        const clockTimer = setInterval(() => {
        const now = new Date();
        setTimeStr(now.toLocaleTimeString('id-ID', { hour12: false }));
        
        const day = now.getDay();
        const mins = now.getHours() * 60 + now.getMinutes();
        if (day >= 1 && day <= 5) setIsOpen(mins >= 360 && mins < 1320);
        else setIsOpen(mins >= 420 && mins < 1380);
        }, 1000);
        return () => clearInterval(clockTimer);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
        setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObserver.unobserve(e.target);
            }
        });
        }, { threshold: 0.12 });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
        return () => revealObserver.disconnect();
    }, [menuFilter, testiPage]);

    useEffect(() => {
        const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
            const target = +e.target.dataset.target;
            const duration = 1600;
            const step = target / (duration / 16);
            let current = 0;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                e.target.textContent = target.toLocaleString('id-ID');
                clearInterval(timer);
                } else {
                e.target.textContent = Math.floor(current).toLocaleString('id-ID');
                }
            }, 16);
            counterObserver.unobserve(e.target);
            }
        });
        }, { threshold: 0.3 });

        document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
        return () => counterObserver.disconnect();
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const nextTesti = () => {
        const maxPage = Math.ceil(testiData.length / TESTI_PER_PAGE) - 1;
        setTestiPage(prev => (prev < maxPage ? prev + 1 : 0));
    };

    const prevTesti = () => {
        const maxPage = Math.ceil(testiData.length / TESTI_PER_PAGE) - 1;
        setTestiPage(prev => (prev > 0 ? prev - 1 : maxPage));
    };

    const filteredMenu = menuFilter === 'all' 
        ? menuData 
        : menuData.filter(c => c.filter === menuFilter);

    return (
        <div className="landing-wrapper">
            <nav id="mainNav" className={`navbar navbar-expand-lg fixed-top ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container">
                <a className="navbar-brand d-flex align-items-center" href="#hero">
                    <img src='/img/logo-warkop.svg' alt="Logo Warkop Si Bontot" className="navbar-logo-img" />
                    <div className="navbar-brand-text ms-2">
                    Warkop Si Bontot<span>Deadline Enjoyer</span>
                    </div>
                </a>

                <div id="live-clock" className="d-none d-lg-flex ms-auto me-3">
                    <i className="bi bi-clock"></i>
                    <span id="clock-display">{timeStr}</span>
                </div>

                <button id="navToggleBtn" className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <i className="bi bi-list fs-2 text-white"></i>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-lg-auto align-items-lg-center gap-lg-3 mt-3 mt-lg-0">
                    <li className="nav-item"><a className="nav-link" href="#hero">Beranda</a></li>
                    <li className="nav-item"><a className="nav-link" href="#about">Tentang</a></li>
                    <li className="nav-item"><a className="nav-link" href="#menu">Menu</a></li>
                    <li className="nav-item"><a className="nav-link" href="#tim">Tim Kami</a></li>
                    <li className="nav-item"><a className="nav-link" href="#testimoni">Testimoni</a></li>
                    <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                        <button className="btn-nav-order" onClick={() => onNavigate?.('')}>Pesan Sekarang!</button>
                    </li>
                    </ul>
                </div>
                </div>
            </nav>

            <section id="hero" className="hero-section">
                <div id="slide-container">
                {heroSlides.map((slide, i) => (
                    <div key={i} className={`hero-slide ${i === currentSlide ? 'active' : ''}`}>
                    <img src={slide.img} alt={`Slide ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} />
                    <div className="overlay"></div>
                    </div>
                ))}
                </div>

                <div className="hero-content-wrapper">
                <div className="container">
                    <div className="row">
                    <div className="col-lg-7">
                        <div className="hero-eyebrow reveal"><i className="bi bi-stars"></i> Tukang Ngopi, Cari Duit Cuma Hobi</div>
                        <h1 className="hero-main-title reveal">Warkop<br /><em>Si Bontot</em></h1>
                        <p className="hero-sub reveal">
                        Tempat nongkrong paling santai di Bojonggede. Kopi enak, cemilan nagih, 
                        suasana hangat cocok banget buat kamu yang mau lepas penat atau kejar deadline bareng.
                        </p>
                        <div className="d-flex flex-sm-row flex-column gap-3 reveal">
                        <a href="#menu" className="btn-primary-hero">Lihat Menu <i className="bi bi-arrow-right"></i></a>
                        <a href="#about" className="btn-secondary-hero">Kenali Kami Dulu</a>
                        </div>

                        <div className="hero-stats reveal">
                        <div className="hero-stat-item"><strong className="counter" data-target="5">0</strong><span>Tahun Berdiri</span></div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat-item"><strong className="counter" data-target="1200">0</strong><span>Pelanggan / Bulan</span></div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat-item"><strong className="counter" data-target="40">0</strong><span>Varian Menu</span></div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>

                <div className="carousel-dots" id="carousel-dots">
                {heroSlides.map((_, i) => (
                    <button key={i} className={`cdot ${i === currentSlide ? 'active' : ''}`} aria-label={`Slide ${i + 1}`} onClick={() => setCurrentSlide(i)}></button>
                ))}
                </div>
            </section>

            <section className="container features-strip">
                <div className="row g-4 align-items-stretch"> 
                <div className="col-md-4 reveal">
                    <div className="feat-card h-100">
                    <div className="feat-icon-wrap"><i className="bi bi-cup-hot-fill"></i></div>
                    <div>
                        <h5>Kopi & Minuman Favorit</h5>
                        <p>Dari kopi hitam yang menemani begadang sampai es kopi susu aren yang sedang hits. Klasik maupun kekinian, semuanya ada.</p>
                    </div>
                    </div>
                </div>
                <div className="col-md-4 reveal">
                    <div className="feat-card h-100 style-divider">
                    <div className="feat-icon-wrap"><i className="bi bi-egg-fried"></i></div>
                    <div>
                        <h5>Indomie & Cemilan Andalan</h5>
                        <p>Indomie racikan khas Si Bontot, nasi goreng, roti bakar lumer, dan camilan yang bikin susah berhenti ngunyah.</p>
                    </div>
                    </div>
                </div>
                <div className="col-md-4 reveal">
                    <div className="feat-card h-100">
                    <div className="feat-icon-wrap"><i className="bi bi-wifi"></i></div>
                    <div>
                        <h5>Nongkrong Tanpa Khawatir</h5>
                        <p>Wi-Fi kencang, colokan tersedia, buka sampai malam. Cocok buat nugas, rapat santai, atau mabar sampai lupa waktu.</p>
                    </div>
                    </div>
                </div>
                </div>
            </section>

            <section id="about">
                <div className="container">
                <div className="row g-5 align-items-center">
                    <div className="col-lg-5 reveal">
                    <div className="about-img-wrap">
                        <img src="/img/warkop-profile.webp" alt="Suasana Warkop Si Bontot" />
                        <div className="about-badge">
                        <strong className="counter" data-target="5">0</strong><span>Tahun Melayani</span>
                        </div>
                    </div>
                    </div>
                    <div className="col-lg-7 reveal">
                    <span className="section-eyebrow">Teman Si Bontot</span>
                    <h2 className="section-heading mb-4">Markas Nongkrong<br />Favorit Anak Muda</h2>
                    <p className="lead-text">
                        Warkop Si Bontot hadir buat kamu yang ingin nongkrong nyaman tanpa bikin dompet pusing. 
                        Mau nugas, mabar, ngobrol sampai larut, atau sekadar cari tempat ngopi dengan suasana yang pas? 
                        Di sini tempatnya.
                    </p>
                    <div className="about-point">
                        <div className="about-point-icon"><i className="bi bi-award-fill"></i></div>
                        <p><strong>Rasa Tidak Main-Main:</strong> Kopi, susu, dan bahan-bahan pilihan yang diracik agar setiap tegukan benar-benar terasa sepadan.</p>
                    </div>
                    <div className="about-point">
                        <div className="about-point-icon"><i className="bi bi-moon-stars-fill"></i></div>
                        <p><strong>Nongkrong Sampai Puas:</strong> Buka sampai malam, cocok untuk yang sedang mengejar deadline atau mabar hingga lupa waktu.</p>
                    </div>
                    <div className="about-point">
                        <div className="about-point-icon"><i className="bi bi-wallet2"></i></div>
                        <p><strong>Harga Tetap Waras:</strong> Nongkrong estetik tidak harus mahal. Makan, minum, dan tetap aman di kantong mahasiswa.</p>
                    </div>
                    </div>
                </div>
                </div>
            </section>

            <section id="menu" className="menu-section">
                <div className="container">
                <div className="text-center mb-2 reveal">
                    <h2 className="section-heading white mt-1">Menu Andalan Si Bontot</h2>
                </div>
                <div className="menu-tabs reveal" id="menu-tabs">
                    {['all', 'kopi', 'nonkopi', 'makanan'].map(tab => (
                    <button key={tab} className={`menu-tab-btn ${menuFilter === tab ? 'active' : ''}`} onClick={() => setMenuFilter(tab)}>
                        {tab === 'all' ? 'Semua' : tab === 'kopi' ? 'Kopi' : tab === 'nonkopi' ? 'Non-Kopi' : 'Makanan'}
                    </button>
                    ))}
                </div>
                <div id="menu-container" className="row g-4 justify-content-center">
                    {filteredMenu.map((cat, idx) => (
                    <div key={idx} className="col-md-6 col-lg-4 reveal">
                        <div className={`menu-card ${cat.isFood ? 'food-card' : ''}`}>
                        <div className="menu-col-labels"><span>Menu</span><span>Harga</span></div>
                        <div className="menu-card-title">{cat.category}</div>
                        <ul className="menu-list">
                            {cat.items.map((item, itemIdx) => (
                            <li key={itemIdx} className={`menu-item ${item.fav ? 'is-fav' : ''}`}>
                                <span className="menu-item-name">{item.fav && <span className="fav-dot"></span>}{item.name}</span>
                                <span className="menu-item-price">{item.price}</span>
                            </li>
                            ))}
                        </ul>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            </section>

            <section id="tim">
                <div className="container">
                <div className="text-center mb-5 reveal">
                    <h2 className="section-heading mt-1">Orang-Orang di Balik Si Bontot</h2>
                    <p className="text-muted mt-2 mx-auto" style={{ maxWidth: '480px', fontSize: '.9rem' }}>
                    Mereka yang setiap hari hadir menyiapkan racikan terbaik untuk kamu.
                    </p>
                </div>
                <div className="row g-4 justify-content-center">
                    {[
                    { img: '/img/hanif.jpeg', name: 'M. Shidqi Hanif Firdaus', role: 'Founder' },
                    { img: '/img/harun.jpg', name: 'Harun Yahya', role: 'Head Barista' },
                    { img: '/img/syahril.jpg', name: 'Syahril Arif Adriansyah', role: 'Operasional' },
                    { img: '/img/rehan.jpeg', name: 'Achmad Raihan', role: 'Roaster' },
                    { img: '/img/omat.jpg', name: 'M. Rizqi Nurrohmat', role: 'Kepala Dapur' }
                    ].map((member, i) => (
                    <div key={i} className="col-6 col-md-4 col-lg-2-custom reveal">
                        <div className="team-card">
                        <div className="team-img-wrap"><img src={member.img} alt={member.name} /></div>
                        <h5>{member.name}</h5>
                        <p>{member.role}</p>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            </section>

            <section id="testimoni">
                <div className="container">
                <div className="text-center mb-5 reveal">
                    <h2 className="section-heading mt-1">Kata Mereka yang Sudah Mampir</h2>
                </div>
                <div className="position-relative px-md-5">
                    <div id="testi-container" className="row g-4">
                    {testiData.slice(testiPage * TESTI_PER_PAGE, testiPage * TESTI_PER_PAGE + TESTI_PER_PAGE).map((t, idx) => (
                        <div key={idx} className="col-md-4 reveal">
                        <div className="testi-card">
                            <div className="testi-stars">{'★'.repeat(t.stars) + '☆'.repeat(5 - t.stars)}</div>
                            <p className="testi-text">"{t.text}"</p>
                            <div className="testi-author">
                            <div className="testi-avatar">{t.name.charAt(0)}</div>
                            <div>
                                <div className="testi-author-name">{t.name}</div>
                                <div className="testi-author-meta">{t.meta}</div>
                            </div>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                    <button className="btn-testi-nav prev" onClick={prevTesti}><i className="bi bi-chevron-left"></i></button>
                    <button className="btn-testi-nav next" onClick={nextTesti}><i className="bi bi-chevron-right"></i></button>
                </div>
                </div>
            </section>

            <footer id="kontak">
                <div className="container footer-top">
                <div className="row g-5">
                    <div className="col-lg-5 reveal">
                    <img src="/img/logo-warkop.svg" alt="Logo Si Bontot" className="footer-logo-img" />
                    <div className="footer-brand-name">Warkop Si Bontot</div>
                    <p className="footer-tagline">"Tukang Ngopi, Cari Duit Cuma Hobi."</p>
                    <div className="footer-address">
                        <i className="bi bi-geo-alt-fill"></i>
                        <span>Jl. Tegar Beriman No.6, Bojong Baru, Kec. Bojonggede, Kabupaten Bogor, Jawa Barat 16920</span>
                    </div>
                    </div>
                    <div className="col-lg-3 offset-lg-1 reveal">
                    <div className="footer-heading">Jam Operasional</div>
                    <div id="open-status-badge" className={`open-status ${isOpen ? 'open' : 'closed'}`}>
                        <span className="dot"></span>
                        <span id="status-text">{isOpen ? 'Sedang Buka' : 'Sedang Tutup'}</span>
                    </div>
                    <div className="footer-ops-item"><strong>Senin – Jumat</strong><span>06.00 – 22.00 WIB</span></div>
                    <div className="footer-ops-item"><strong>Sabtu – Minggu</strong><span>07.00 – 23.00 WIB</span></div>
                    </div>
                    <div className="col-lg-3 reveal">
                    <div className="footer-heading">Lokasi</div>
                    <div className="map-holder">
                        <iframe src="https://maps.google.com/maps?q=Bojonggede&t=&z=13&ie=UTF8&iwloc=&output=embed" width="100%" height="140" style={{ border: 0 }} allowFullScreen loading="lazy" title="Lokasi Warkop Si Bontot"></iframe>
                    </div>
                    </div>
                </div>
                </div>
                <div className="footer-bottom">
                <div className="container d-flex flex-sm-row flex-column align-items-center justify-content-between gap-2">
                    <small>© 2026 Warkop Si Bontot. Semua hak dilindungi.</small>
                    <small>Dibuat Oleh Deadline Enjoyer</small>
                </div>
                </div>
            </footer>

            <button id="scrollTop" className={showScrollTop ? 'show' : ''} aria-label="Kembali ke atas" onClick={scrollToTop}>
                <i className="bi bi-arrow-up"></i>
            </button>
        </div>
    );
}
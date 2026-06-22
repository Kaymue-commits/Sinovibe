/* =============================================================
   思源文境 · Sinovibe 全站交互脚本
   功能：导航吸顶、移动端菜单、滚动渐入、平滑滚动、返回顶部、
         图片懒加载、当前页高亮、分页切换、文章筛选
   ============================================================= */

(function () {
  'use strict';

  /* ---------------- 1. 导航吸顶 + 滚动状态 ---------------- */
  const navBar = document.querySelector('.nav-bar');
  const onScroll = () => {
    if (!navBar) return;
    if (window.scrollY > 40) navBar.classList.add('scrolled');
    else navBar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- 2. 移动端汉堡菜单 ---------------- */
  const menuBtn = document.querySelector('.menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeMenuBtn = document.querySelector('.close-menu');
  const toggleMenu = (open) => {
    if (!mobileMenu) return;
    if (open) {
      mobileMenu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    } else {
      mobileMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  };
  menuBtn && menuBtn.addEventListener('click', () => toggleMenu(true));
  closeMenuBtn && closeMenuBtn.addEventListener('click', () => toggleMenu(false));
  mobileMenu && mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => toggleMenu(false));
  });

  /* ---------------- 3. 滚动渐入（IntersectionObserver） ---------------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------- 4. 返回顶部按钮 ---------------- */
  const backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    const toggleBack = () => {
      if (window.scrollY > 600) backBtn.classList.add('is-visible');
      else backBtn.classList.remove('is-visible');
    };
    window.addEventListener('scroll', toggleBack, { passive: true });
    toggleBack();
    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- 5. 图片懒加载 ---------------- */
  const lazyImgs = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    const imgIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
          imgIO.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    lazyImgs.forEach((img) => imgIO.observe(img));
  } else {
    lazyImgs.forEach((img) => {
      img.src = img.dataset.src;
    });
  }

  /* ---------------- 6. 当前页导航高亮 ---------------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const target = link.getAttribute('data-nav');
    if (target === currentPath || (currentPath === '' && target === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---------------- 7. 文章筛选 & 分页（专栏页） ---------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const articleCards = document.querySelectorAll('.article-card');
  if (filterBtns.length > 0 && articleCards.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const cat = btn.dataset.filter;
        articleCards.forEach((card) => {
          if (cat === 'all' || card.dataset.category === cat) {
            card.style.display = '';
            setTimeout(() => card.classList.add('is-visible'), 30);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* 排序按钮 */
  const sortBtns = document.querySelectorAll('.sort-btn');
  const articleList = document.querySelector('[data-article-list]');
  if (sortBtns.length > 0 && articleList) {
    sortBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        sortBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const mode = btn.dataset.sort;
        const cards = Array.from(articleList.querySelectorAll('.article-card'));
        cards.sort((a, b) => {
          const ta = new Date(a.dataset.date).getTime();
          const tb = new Date(b.dataset.date).getTime();
          const va = parseInt(a.dataset.views || '0', 10);
          const vb = parseInt(b.dataset.views || '0', 10);
          if (mode === 'hot') return vb - va;
          return tb - ta;
        });
        cards.forEach((c) => articleList.appendChild(c));
      });
    });
  }

  /* 分页切换（前端演示） */
  const pageBtns = document.querySelectorAll('.page-btn');
  pageBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-disabled')) return;
      pageBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      window.scrollTo({ top: articleList ? articleList.offsetTop - 120 : 0, behavior: 'smooth' });
    });
  });

  /* ---------------- 8. 留言表单（前端校验） ---------------- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = (formData.get('name') || '').toString().trim();
      const message = (formData.get('message') || '').toString().trim();
      if (!name || !message) {
        alert('请填写姓名与留言内容');
        return;
      }
      const success = document.getElementById('form-success');
      if (success) {
        success.classList.remove('hidden');
        success.classList.add('flex');
      }
      contactForm.reset();
      setTimeout(() => {
        if (success) {
          success.classList.add('hidden');
          success.classList.remove('flex');
        }
      }, 4500);
    });
  }

  /* ---------------- 9. 年份自动更新（footer） ---------------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------- 10. 鼠标视差（hero 装饰元素） ---------------- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && window.matchMedia('(min-width: 768px)').matches) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      parallaxEls.forEach((el) => {
        const depth = parseFloat(el.dataset.parallax) || 10;
        el.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    });
  }
})();

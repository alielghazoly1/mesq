// سياسة الخصوصية (/privacy) والشروط (/terms) — بالعربي والإنجليزي حسب لغة
// الموقع. مكتوبين على اللي الموقع بيعمله فعلًا (الحسابات، الدخول بجوجل،
// الدعوات وردود الضيوف، الدفع بالتحويل، الكوكيز). جوجل بتطلب لينك سياسة
// الخصوصية عشان "الدخول بجوجل" يتنشر لكل الناس.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { whatsappLink, WHATSAPP_MESSAGES, phoneDisplay } from '../lib/contact.js';

const EMAIL = 'mithaq@mithaq-invitation.com';
const UPDATED = { ar: 'آخر تحديث: 18 أكتوبر 2026', en: 'Last updated: 18 October 2026' };

const PRIVACY = {
  ar: {
    title: 'سياسة الخصوصية',
    intro: 'ميثاق (mithaq-invitation.com) موقع لعمل دعوات أفراح وخطوبة إلكترونية. الصفحة دي بتوضح إيه البيانات اللي بنجمعها، وبنستخدمها في إيه، وإزاي تقدر تتحكم فيها.',
    sections: [
      ['البيانات اللي بنجمعها', [
        'بيانات الحساب: الاسم، الإيميل، الدولة (عشان الأسعار تظهر بعملتك)، ورقم التليفون/الواتساب لو كتبته.',
        'لو دخلت بجوجل: بنستلم من جوجل اسمك وإيميلك ورقم حسابك عند جوجل (معرّف ثابت) بس — مش بنوصل لباسورد جوجل ولا لأي بيانات تانية في حسابك.',
        'محتوى الدعوات اللي بتعملها: الأسامي، المواعيد، المكان، الصور والفيديوهات والأغاني اللي بترفعها.',
        'ردود الضيوف على دعوتك: تأكيد الحضور ورسايلهم، والصور أو التهاني الصوتية لو الخاصية دي مفعّلة.',
        'صور إيصالات التحويل اللي بترفعها عشان نفعّل باقتك.',
        'بيانات استخدام بسيطة: عدد فتحات الدعوة، وآخر مرة كنت فاتح فيها الموقع.',
      ]],
      ['بنستخدمها في إيه', [
        'تشغيل حسابك وعرض دعوتك لضيوفك وتوصيل ردودهم ليك.',
        'تفعيل الباقة بعد مراجعة الإيصال، والتواصل معاك بخصوص طلبك أو الدعم.',
        'تحسين الموقع ومعرفة الإعلانات اللي بتجيب عملاء (بشكل مجمّع).',
        'مش بنبيع بياناتك ولا بنديها لأي حد لأغراض إعلانية.',
      ]],
      ['الكوكيز', [
        'كوكي تسجيل الدخول عشان تفضل داخل على حسابك.',
        'كوكي لينك الإحالة أو الإعلان (30 يوم) عشان نعرف انت جيت منين لو سجّلت.',
        'إعدادات بسيطة على جهازك زي لغة الموقع.',
      ]],
      ['مين بيشوف البيانات', [
        'دعوتك بتظهر لأي حد معاه اللينك بتاعها. ردود الضيوف بتظهر ليك انت بس في لوحتك.',
        'بنستخدم خدمات موثوقة لتشغيل الموقع: استضافة السيرفر وقاعدة البيانات، وCloudinary لتخزين الصور والملفات، وGoogle لتسجيل الدخول بجوجل وخرايط المكان.',
      ]],
      ['حقوقك', [
        'تقدر تعدّل بيانات دعوتك من المحرر في أي وقت خلال مدة التعديل.',
        'تقدر تطلب نسخة من بياناتك أو تمسح حسابك وكل دعواته في أي وقت — كلّمنا وهنعملها.',
        'لو دخلت بجوجل تقدر تلغي ربط ميثاق بحسابك من إعدادات حساب جوجل (Security ← Third-party apps).',
      ]],
      ['الحماية', [
        'الباسوردات متخزّنة متشفّرة (hash) بس، والاتصال بالموقع مشفّر (HTTPS)، والدخول بجوجل بيتأكد منه السيرفر بتوقيع جوجل نفسها.',
      ]],
    ],
  },
  en: {
    title: 'Privacy Policy',
    intro: 'Mithaq (mithaq-invitation.com) is a service for creating online wedding and engagement invitations. This page explains what data we collect, why, and how you control it.',
    sections: [
      ['Data we collect', [
        'Account data: your name, email, country (so prices show in your currency) and phone/WhatsApp number if you add one.',
        'If you sign in with Google: we receive only your name, email address and Google account ID from Google — never your Google password or any other data in your account.',
        'The content of invitations you create: names, dates, venue, and the photos, videos and music you upload.',
        'Your guests’ replies: RSVPs and messages, plus photos or voice greetings if that feature is enabled.',
        'Payment receipt images you upload so we can activate your package.',
        'Basic usage data: invitation view counts and when you were last active on the site.',
      ]],
      ['How we use it', [
        'To run your account, show your invitation to your guests and deliver their replies to you.',
        'To activate your package after reviewing your receipt, and to contact you about your order or support.',
        'To improve the site and measure which ads bring customers (in aggregate).',
        'We do not sell your data or share it with anyone for advertising.',
      ]],
      ['Cookies', [
        'A login cookie to keep you signed in.',
        'A referral/ad-link cookie (30 days) so we know where you came from if you sign up.',
        'Small preferences stored on your device, such as the site language.',
      ]],
      ['Who can see your data', [
        'Your invitation is visible to anyone who has its link. Guest replies are visible only to you in your dashboard.',
        'We use trusted providers to run the service: server and database hosting, Cloudinary for storing images and files, and Google for Google sign-in and venue maps.',
      ]],
      ['Your rights', [
        'You can edit your invitation in the editor at any time during your editing period.',
        'You can ask for a copy of your data or for your account and all its invitations to be deleted at any time — just contact us.',
        'If you signed in with Google you can remove Mithaq’s access from your Google Account settings (Security → Third-party apps).',
      ]],
      ['Security', [
        'Passwords are stored only as hashes, the site is served over HTTPS, and Google sign-ins are verified on our server against Google’s own signatures.',
      ]],
    ],
  },
};

const TERMS = {
  ar: {
    title: 'الشروط والأحكام',
    intro: 'باستخدامك لميثاق (mithaq-invitation.com) انت موافق على الشروط دي.',
    sections: [
      ['الخدمة', [
        'ميثاق بيوفّر تصاميم دعوات إلكترونية تقدر تعدّلها وتبعت لينكها لضيوفك، مع تأكيد الحضور وإضافات حسب الباقة.',
      ]],
      ['الحساب', [
        'انت مسؤول عن صحة بياناتك وعن أي نشاط على حسابك. تقدر تدخل بالإيميل والباسورد أو بحساب جوجل.',
      ]],
      ['الباقات والدفع', [
        'الباقات بتتفعّل بعد ما ندفع بالتحويل (فودافون كاش، إنستاباي، تحويل بنكي أو غيرها) ونراجع الإيصال.',
        'مدة التعديل بتختلف حسب الباقة وبتبدأ من يوم التفعيل، والدعوة بتفضل شغالة بعدها زي ما سبتها.',
        'السعر بيظهر بعملة بلدك ووقت الطلب بيتثبّت عليه.',
      ]],
      ['المحتوى', [
        'انت مسؤول عن المحتوى اللي بتحطه في دعوتك (صور، كلام، أغاني) وإن عندك الحق تستخدمه.',
        'ممنوع استخدام الموقع في أي محتوى مسيء أو مخالف للقانون، ومن حقنا نوقف أي دعوة أو حساب مخالف.',
      ]],
      ['تواصل', [
        'لأي سؤال أو مشكلة كلّمنا وهنساعدك.',
      ]],
    ],
  },
  en: {
    title: 'Terms of Service',
    intro: 'By using Mithaq (mithaq-invitation.com) you agree to these terms.',
    sections: [
      ['The service', [
        'Mithaq provides online invitation designs that you can customise and share with your guests by link, with RSVP and extras depending on your package.',
      ]],
      ['Your account', [
        'You are responsible for the accuracy of your details and for activity on your account. You can sign in with email and password or with your Google account.',
      ]],
      ['Packages and payment', [
        'Packages are activated after you pay by transfer (Vodafone Cash, InstaPay, bank transfer or other listed methods) and we review your receipt.',
        'The editing period depends on your package and starts on the activation date; your invitation stays online afterwards exactly as you left it.',
        'Prices are shown in your country’s currency and locked at the time of your order.',
      ]],
      ['Content', [
        'You are responsible for the content you add to your invitation (photos, text, music) and for having the right to use it.',
        'The service must not be used for offensive or unlawful content; we may suspend any invitation or account that breaks these terms.',
      ]],
      ['Contact', [
        'For any question or problem, contact us and we will help.',
      ]],
    ],
  },
};

export default function LegalPage({ kind }) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const doc = (kind === 'terms' ? TERMS : PRIVACY)[lang];
  useEffect(() => { document.title = `${doc.title} | Mithaq`; }, [doc.title]);

  return (
    <div className="min-h-screen bg-ivory">
      <article className="mx-auto max-w-2xl px-5 pb-28 pt-8 sm:px-6" dir={lang === 'ar' ? 'rtl' : 'ltr'} data-legal={kind}>
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-ink-dim hover:text-rose">
          <ArrowRight size={15} className={lang === 'ar' ? '' : 'rotate-180'} /> {lang === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
        <h1 className="font-serif text-3xl font-bold text-ink">{doc.title}</h1>
        <p className="mt-1.5 text-[12.5px] text-ink-dim">{UPDATED[lang]}</p>
        <p className="mt-5 text-[15px] leading-relaxed text-ink">{doc.intro}</p>
        {doc.sections.map(([h, items]) => (
          <section key={h} className="mt-7">
            <h2 className="text-[17px] font-extrabold text-ink">{h}</h2>
            <ul className="mt-2.5 list-disc space-y-1.5 ps-5 text-[14.5px] leading-relaxed text-ink/85">
              {items.map((it) => <li key={it}>{it}</li>)}
            </ul>
          </section>
        ))}
        <section className="mt-8 rounded-2xl border border-line bg-card p-5 text-[14px] leading-relaxed text-ink">
          <p className="font-extrabold">{lang === 'ar' ? 'تواصل معانا' : 'Contact us'}</p>
          <p className="mt-1.5">
            {lang === 'ar' ? 'الإيميل: ' : 'Email: '}<a className="text-rose underline" href={`mailto:${EMAIL}`} dir="ltr">{EMAIL}</a>
          </p>
          <p className="mt-1">
            {lang === 'ar' ? 'واتساب: ' : 'WhatsApp: '}<a className="text-rose underline" href={whatsappLink(WHATSAPP_MESSAGES.help)} target="_blank" rel="noopener noreferrer" dir="ltr">{phoneDisplay}</a>
          </p>
        </section>
        <p className="mt-6 text-[13px] text-ink-dim">
          {kind === 'terms'
            ? <Link to="/privacy" className="underline">{PRIVACY[lang].title}</Link>
            : <Link to="/terms" className="underline">{TERMS[lang].title}</Link>}
        </p>
      </article>
    </div>
  );
}

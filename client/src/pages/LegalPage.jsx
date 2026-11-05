// سياسة الخصوصية (/privacy) والشروط والأحكام (/terms) وسياسة الاسترجاع (/refund)
// وتواصل معانا (/contact) — بالعربي والإنجليزي حسب لغة الموقع. مكتوبين على
// اللي الموقع بيعمله فعلًا (الحسابات، الدخول بجوجل، الدعوات وردود الضيوف، الدفع،
// الكوكيز). جوجل بتطلب لينك سياسة الخصوصية عشان "الدخول بجوجل" يتنشر لكل الناس،
// وبوابة الدفع (XPay) بتطلب الشروط والاسترجاع وصفحة تواصل فيها تليفون وإيميل وعنوان في مصر.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Phone, MessageCircle, Mail, MapPin } from 'lucide-react';
import { whatsappLink, WHATSAPP_MESSAGES, phoneDisplay, phoneIntlDisplay, telLink, CONTACT_EMAIL as EMAIL, ADDRESS } from '../lib/contact.js';

const UPDATED = {
  privacy: { ar: 'آخر تحديث: 18 أكتوبر 2026', en: 'Last updated: 18 October 2026' },
  terms: { ar: 'آخر تحديث: 6 نوفمبر 2026', en: 'Last updated: 6 November 2026' },
  refund: { ar: 'آخر تحديث: 6 نوفمبر 2026', en: 'Last updated: 6 November 2026' },
};

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
    intro: 'باستخدامك لميثاق (mithaq-invitation.com) انت موافق على الشروط والأحكام دي.',
    sections: [
      ['الخدمة', [
        'ميثاق بيوفّر تصاميم دعوات إلكترونية تقدر تعدّلها وتبعت لينكها لضيوفك، مع تأكيد الحضور وإضافات حسب الباقة.',
      ]],
      ['الحساب', [
        'انت مسؤول عن صحة بياناتك وعن أي نشاط على حسابك. تقدر تدخل بالإيميل والباسورد أو بحساب جوجل.',
      ]],
      ['الباقات والدفع', [
        'الأسعار ظاهرة في صفحة الباقات بعملة بلدك (في مصر بالجنيه المصري)، والسعر بيتثبّت وقت الطلب.',
        'بتدفع بإحدى طرق الدفع المتاحة في صفحة الدفع (زي فودافون كاش أو إنستاباي أو التحويل البنكي)، والباقة بتتفعّل على حسابك بعد ما الدفع يتأكد.',
        'مدة التعديل بتختلف حسب الباقة وبتبدأ من يوم التفعيل، والدعوة بتفضل شغالة بعدها زي ما سبتها.',
      ]],
      ['الاسترجاع', [
        <>إمتى تقدر تسترجع فلوسك وإزاي، موضّح في <Link to="/refund" className="font-bold text-rose underline">سياسة الاسترجاع</Link>.</>,
      ]],
      ['المحتوى', [
        'انت مسؤول عن المحتوى اللي بتحطه في دعوتك (صور، كلام، أغاني) وإن عندك الحق تستخدمه.',
        'ممنوع استخدام الموقع في أي محتوى مسيء أو مخالف للقانون، ومن حقنا نوقف أي دعوة أو حساب مخالف.',
      ]],
      ['القانون', [
        'الشروط والأحكام دي خاضعة لقوانين جمهورية مصر العربية.',
      ]],
      ['تواصل', [
        'لأي سؤال أو مشكلة كلّمنا وهنساعدك.',
      ]],
    ],
  },
  en: {
    title: 'Terms and Conditions',
    intro: 'By using Mithaq (mithaq-invitation.com) you agree to these terms and conditions.',
    sections: [
      ['The service', [
        'Mithaq provides online invitation designs that you can customise and share with your guests by link, with RSVP and extras depending on your package.',
      ]],
      ['Your account', [
        'You are responsible for the accuracy of your details and for activity on your account. You can sign in with email and password or with your Google account.',
      ]],
      ['Packages and payment', [
        'Prices are shown on the packages page in your country’s currency (Egyptian pounds in Egypt) and are locked at the time of your order.',
        'You pay with one of the methods offered on the checkout page (such as Vodafone Cash, InstaPay or bank transfer); your package is activated on your account once the payment is confirmed.',
        'The editing period depends on your package and starts on the activation date; your invitation stays online afterwards exactly as you left it.',
      ]],
      ['Refunds', [
        <>When and how you can get a refund is explained in our <Link to="/refund" className="font-bold text-rose underline">Refund Policy</Link>.</>,
      ]],
      ['Content', [
        'You are responsible for the content you add to your invitation (photos, text, music) and for having the right to use it.',
        'The service must not be used for offensive or unlawful content; we may suspend any invitation or account that breaks these terms.',
      ]],
      ['Governing law', [
        'These terms and conditions are governed by the laws of the Arab Republic of Egypt.',
      ]],
      ['Contact', [
        'For any question or problem, contact us and we will help.',
      ]],
    ],
  },
};

const REFUND = {
  ar: {
    title: 'سياسة الاسترجاع',
    intro: 'ميثاق بيبيع باقات دعوات إلكترونية (خدمة رقمية). الصفحة دي بتوضح إمتى تقدر تسترجع فلوسك، وإزاي تطلب ده، وإمتى الفلوس بترجعلك.',
    sections: [
      ['إمتى بنرجّعلك فلوسك', [
        'لو طلبت الاسترجاع قبل ما الباقة تتفعّل على حسابك: بنرجّعلك المبلغ كامل.',
        'لو دفعت مرتين أو دفعت مبلغ أكبر من سعر الباقة بالغلط: بنرجّعلك الزيادة كاملة.',
        'لو حصلت مشكلة تقنية من عندنا منعتك تستخدم باقتك ومقدرناش نحلها خلال 3 أيام من ما تبلّغنا: بنرجّعلك المبلغ كامل.',
      ]],
      ['إمتى مينفعش الاسترجاع', [
        'بعد ما الباقة تتفعّل، لأن الخدمة رقمية وبتبقى متاحة لك على طول — إلا في الحالات اللي فوق.',
        'لو الدعوة اتعملت واتبعتت للضيوف، حتى لو غيّرت رأيك بعدها.',
      ]],
      ['إزاي تطلب الاسترجاع', [
        'كلّمنا على الواتساب أو الإيميل (تحت)، وابعت الإيميل أو رقم التليفون اللي مسجّل بيه، وإثبات الدفع (صورة الإيصال أو رقم العملية).',
        'هنرد على طلبك خلال 3 أيام عمل.',
      ]],
      ['الفلوس بترجع إزاي وإمتى', [
        'بنرجّع المبلغ بنفس طريقة الدفع اللي دفعت بيها: الكارت البنكي، أو المحفظة الإلكترونية (زي فودافون كاش)، أو إنستاباي، أو التحويل البنكي.',
        'بنعمل الاسترجاع خلال 7 أيام عمل من الموافقة على الطلب. لو دفعت بالكارت، البنك ممكن ياخد لحد 14 يوم عمل لحد ما المبلغ يظهر في حسابك.',
      ]],
    ],
  },
  en: {
    title: 'Refund Policy',
    intro: 'Mithaq sells online invitation packages (a digital service). This page explains when you can get a refund, how to request one, and when the money reaches you.',
    sections: [
      ['When you get a refund', [
        'If you ask for a refund before your package is activated on your account: full refund.',
        'If you paid twice, or paid more than the package price by mistake: the extra amount is refunded in full.',
        'If a technical problem on our side stops you from using your package and we cannot fix it within 3 days of your report: full refund.',
      ]],
      ['When refunds are not possible', [
        'After your package is activated, because the service is digital and available to you immediately — except in the cases above.',
        'After your invitation has been created and sent to your guests, even if you change your mind.',
      ]],
      ['How to request a refund', [
        'Contact us on WhatsApp or by email (below) with the email or phone number on your account and your proof of payment (receipt image or transaction number).',
        'We reply to every request within 3 business days.',
      ]],
      ['How and when the money is returned', [
        'Refunds go back to your original payment method: bank card, mobile wallet (such as Vodafone Cash), InstaPay or bank transfer.',
        'We process approved refunds within 7 business days. For card payments, your bank may take up to 14 business days to show the amount in your account.',
      ]],
    ],
  },
};

const CONTACT = {
  ar: {
    title: 'تواصل معانا',
    intro: 'عندك سؤال عن الباقات أو الدفع، أو محتاج مساعدة في دعوتك؟ كلّمنا بأي طريقة من دول.',
    phone: 'التليفون / واتساب', whatsapp: 'ابعتلنا واتساب', email: 'الإيميل', address: 'العنوان',
  },
  en: {
    title: 'Contact Us',
    intro: 'Questions about packages or payment, or need help with your invitation? Reach us any of these ways.',
    phone: 'Phone / WhatsApp', whatsapp: 'Message us on WhatsApp', email: 'Email', address: 'Address',
  },
};

const DOCS = { privacy: PRIVACY, terms: TERMS, refund: REFUND, contact: CONTACT };
// لينكات الصفحات التانية تحت كل صفحة
const PAGES = [['terms', '/terms'], ['refund', '/refund'], ['privacy', '/privacy'], ['contact', '/contact']];

/** صفحة "تواصل معانا": التليفون والواتساب والإيميل والعنوان، كل واحد في كارت */
function ContactCards({ lang }) {
  const c = CONTACT[lang];
  const card = 'flex items-start gap-3.5 rounded-2xl border border-line bg-card p-4 sm:p-5';
  const icon = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose/10 text-rose';
  return (
    <div className="mt-7 grid gap-3" data-contact>
      <div className={card}>
        <span className={icon}><Phone size={18} /></span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-ink-dim">{c.phone}</p>
          <a href={telLink} className="mt-0.5 block text-[17px] font-extrabold text-ink hover:text-rose" dir="ltr" data-phone>{phoneDisplay}</a>
          <p className="text-[12.5px] text-ink-dim" dir="ltr">{phoneIntlDisplay}</p>
          <a href={whatsappLink(WHATSAPP_MESSAGES.help)} target="_blank" rel="noopener noreferrer" className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/15 px-3.5 py-1.5 text-[13px] font-bold text-[#1a8f47] hover:bg-[#25D366]/25">
            <MessageCircle size={15} /> {c.whatsapp}
          </a>
        </div>
      </div>
      <div className={card}>
        <span className={icon}><Mail size={18} /></span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-ink-dim">{c.email}</p>
          <a href={`mailto:${EMAIL}`} className="mt-0.5 block break-all text-[16px] font-extrabold text-ink hover:text-rose" dir="ltr" data-email>{EMAIL}</a>
        </div>
      </div>
      <div className={card}>
        <span className={icon}><MapPin size={18} /></span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-ink-dim">{c.address}</p>
          <p className="mt-0.5 text-[16px] font-extrabold leading-relaxed text-ink" data-address>{ADDRESS[lang]}</p>
        </div>
      </div>
    </div>
  );
}

export default function LegalPage({ kind }) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const doc = (DOCS[kind] || PRIVACY)[lang];
  useEffect(() => { document.title = `${doc.title} | Mithaq`; }, [doc.title]);

  return (
    <div className="min-h-screen bg-ivory">
      <article className="mx-auto max-w-2xl px-5 pb-28 pt-8 sm:px-6" dir={lang === 'ar' ? 'rtl' : 'ltr'} data-legal={kind}>
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-ink-dim hover:text-rose">
          <ArrowRight size={15} className={lang === 'ar' ? '' : 'rotate-180'} /> {lang === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
        <h1 className="font-serif text-3xl font-bold text-ink">{doc.title}</h1>
        {UPDATED[kind] && <p className="mt-1.5 text-[12.5px] text-ink-dim">{UPDATED[kind][lang]}</p>}
        <p className="mt-5 text-[15px] leading-relaxed text-ink">{doc.intro}</p>
        {kind === 'contact' && <ContactCards lang={lang} />}
        {(doc.sections || []).map(([h, items]) => (
          <section key={h} className="mt-7">
            <h2 className="text-[17px] font-extrabold text-ink">{h}</h2>
            <ul className="mt-2.5 list-disc space-y-1.5 ps-5 text-[14.5px] leading-relaxed text-ink/85">
              {items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          </section>
        ))}
        {kind !== 'contact' && (
          <section className="mt-8 rounded-2xl border border-line bg-card p-5 text-[14px] leading-relaxed text-ink">
            <p className="font-extrabold">{lang === 'ar' ? 'تواصل معانا' : 'Contact us'}</p>
            <p className="mt-1.5">
              {lang === 'ar' ? 'الإيميل: ' : 'Email: '}<a className="text-rose underline" href={`mailto:${EMAIL}`} dir="ltr">{EMAIL}</a>
            </p>
            <p className="mt-1">
              {lang === 'ar' ? 'التليفون / واتساب: ' : 'Phone / WhatsApp: '}<a className="text-rose underline" href={whatsappLink(WHATSAPP_MESSAGES.help)} target="_blank" rel="noopener noreferrer" dir="ltr">{phoneDisplay}</a>
            </p>
            <p className="mt-1">{lang === 'ar' ? 'العنوان: ' : 'Address: '}{ADDRESS[lang]}</p>
          </section>
        )}
        <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-ink-dim">
          {PAGES.filter(([k]) => k !== kind).map(([k, to]) => (
            <Link key={k} to={to} className="underline hover:text-rose">{DOCS[k][lang].title}</Link>
          ))}
        </nav>
      </article>
    </div>
  );
}

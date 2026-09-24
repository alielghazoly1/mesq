// صفحة شروط الاستخدام — /terms
//
// بتتعرض قبل الدفع (checkbox في صفحة الدفع بيوصّل هنا) وكمان في الفوتر.
// المحتوى ثنائي اللغة، بيتعرض حسب لغة الواجهة. ده نص احترافي عام مناسب
// لخدمة دعوات رقمية بمدفوعات — مش بديل عن مراجعة قانونية لو احتجتها.
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ScrollText } from 'lucide-react';
import Footer from '../components/Footer.jsx';
import { whatsappLink } from '../lib/contact.js';

// آخر تحديث — يتغيّر يدويًا مع أي تعديل جوهري
const UPDATED = { ar: '٢٤ سبتمبر ٢٠٢٦', en: '24 September 2026' };

const SECTIONS = [
  {
    ar: { t: 'قبول الشروط', b: [
      'باستخدامك موقع ميثاق أو إنشائك دعوة أو دفعك لأي باقة، بتكون وافقت على الشروط دي كاملة. لو مش موافق على أي جزء منها، من فضلك ماتستخدمش الخدمة.',
      'الشروط دي بتنطبق على كل زوّار الموقع وعملائه، سواء استخدموا الباقة المجانية أو المدفوعة.',
    ] },
    en: { t: 'Acceptance of terms', b: [
      'By using Mithaq, creating an invitation, or paying for any package, you agree to these terms in full. If you do not agree to any part, please do not use the service.',
      'These terms apply to all visitors and customers, whether on the free or a paid plan.',
    ] },
  },
  {
    ar: { t: 'الخدمة', b: [
      'ميثاق بيوفّر أداة لإنشاء دعوات أفراح وخطوبة رقمية، وتخصيصها بمحرّر مباشر، ونشرها على لينك يتشارك، مع استقبال ردود تأكيد الحضور وإحصائيات بسيطة.',
      'الدعوة المنشورة بتفضل شغّالة على اللينك بتاعها من غير حد زمني ولا حد لعدد الضيوف، طول ما الخدمة شغّالة.',
    ] },
    en: { t: 'The service', b: [
      'Mithaq provides a tool to create digital wedding and engagement invitations, customise them in a live editor, publish them on a shareable link, and collect RSVP replies and basic statistics.',
      'A published invitation stays live on its link with no time limit and no cap on the number of guests, for as long as the service operates.',
    ] },
  },
  {
    ar: { t: 'الحساب والأهلية', b: [
      'بعض المزايا بتتطلب حساب. إنت مسؤول عن صحة بياناتك وعن الحفاظ على سرية دخولك، وعن أي نشاط بيحصل من حسابك.',
      'لازم تكون عندك الأهلية القانونية لإبرام عقد. لو بتستخدم الخدمة نيابة عن جهة، بتأكّد إن عندك الصلاحية لده.',
    ] },
    en: { t: 'Accounts & eligibility', b: [
      'Some features require an account. You are responsible for the accuracy of your details, for keeping your login confidential, and for any activity under your account.',
      'You must be legally able to enter a contract. If you use the service on behalf of an organisation, you confirm you are authorised to do so.',
    ] },
  },
  {
    ar: { t: 'الباقات والأسعار والدفع', b: [
      'الأسعار بتظهر بعملة بلدك (جنيه مصري للعملاء في مصر، دولار أمريكي لغيرهم)، وبتشمل عدد دعوات محدد لكل باقة.',
      'الدفع بيتم بالفيزا/الماستر كارد عن طريق بوابة الدفع الآمنة XPay، أو بفودافون كاش للعملاء في مصر. بيانات بطاقتك بتتعامل معاها بوابة الدفع مباشرة، وميثاق مابيشوفش ولا بيخزّن رقم بطاقتك.',
      'الأسعار والخصومات ممكن تتغيّر في أي وقت، بس أي تغيير مابيأثرش على طلب اتدفع خلاص. المبلغ اللي بتشوفه وقت الدفع هو المبلغ اللي بيتحاسب عليه.',
    ] },
    en: { t: 'Packages, pricing & payment', b: [
      'Prices are shown in your country’s currency (Egyptian Pounds for customers in Egypt, US Dollars otherwise) and include a set number of invitations per package.',
      'Payment is made by Visa/Mastercard through the secure XPay payment gateway, or by Vodafone Cash for customers in Egypt. Your card details are handled directly by the payment gateway; Mithaq never sees or stores your card number.',
      'Prices and discounts may change at any time, but no change affects an order already paid. The amount shown at checkout is the amount charged.',
    ] },
  },
  {
    ar: { t: 'رصيد الدعوات ومدة التعديل', b: [
      'كل باقة بتديك رصيد دعوات بيتضاف لحسابك بعد تأكيد الدفع. الرصيد بيتخصم دعوة دعوة أول ما تنشرها.',
      'التعديل على الدعوة بالمحرّر متاح لمدة محددة (مبيّنة وقت الشراء) من تاريخ تفعيل الباقة. بعد المدة دي الدعوة بتفضل منشورة وشغّالة، بس التعديل بيتقفل لحد ما تجدّد.',
    ] },
    en: { t: 'Invitation credits & editing window', b: [
      'Each package grants invitation credits added to your account after payment is confirmed. Credits are used one at a time as you publish each invitation.',
      'Editing an invitation in the editor is available for a set period (shown at purchase) from the date the package is activated. After that period the invitation stays published and live, but editing is locked until you renew.',
    ] },
  },
  {
    ar: { t: 'سياسة الاسترجاع', b: [
      'الخدمة رقمية وبتتفعّل فورًا بعد الدفع، فالرسوم بشكل عام غير قابلة للاسترجاع بعد تفعيل الباقة أو نشر الدعوة.',
      'لو حصلت مشكلة تقنية من ناحيتنا منعتك تستخدم اللي دفعت مقابله، تواصل مع الدعم خلال ٧ أيام وهنحلها معاك أو نرجّعلك المبلغ حسب الحالة. تقييم كل حالة بيكون باجتهاد معقول ومنصف.',
    ] },
    en: { t: 'Refund policy', b: [
      'The service is digital and activates immediately after payment, so fees are generally non-refundable once a package is activated or an invitation is published.',
      'If a technical failure on our side prevented you from using what you paid for, contact support within 7 days and we will fix it or refund you as appropriate. Each case is assessed reasonably and fairly.',
    ] },
  },
  {
    ar: { t: 'الاستخدام المقبول والمحتوى', b: [
      'إنت المسؤول الوحيد عن المحتوى اللي بتحطه في دعوتك (أسماء، صور، نصوص). بتأكّد إن عندك الحق في استخدامه وإنه مايخالفش القانون ولا حقوق حد.',
      'ممنوع تستخدم الخدمة في أي محتوى غير قانوني، مسيء، مضلّل، أو بينتحل شخصية غيرك، أو في إرسال رسائل مزعجة. ولنا الحق نوقف أو نشيل أي دعوة بتخالف ده من غير إشعار مسبق.',
    ] },
    en: { t: 'Acceptable use & content', b: [
      'You are solely responsible for the content you put in your invitation (names, photos, text). You confirm you have the right to use it and that it breaks no law or third-party right.',
      'You may not use the service for any unlawful, offensive, misleading, or impersonating content, or to send spam. We may suspend or remove any invitation that breaches this without prior notice.',
    ] },
  },
  {
    ar: { t: 'الملكية الفكرية', b: [
      'تصاميم القوالب والموقع وكوده وعلامته ملك لميثاق. الباقة بتديك حق استخدام القوالب لدعواتك إنت، ومابتنقلش ملكيتها ليك.',
      'المحتوى اللي بترفعه يفضل ملكك، وإنت بتديلنا إذن نستضيفه ونعرضه عشان نقدّملك الخدمة.',
    ] },
    en: { t: 'Intellectual property', b: [
      'The template designs, the site, its code and brand belong to Mithaq. Your package grants you the right to use the templates for your own invitations; it does not transfer ownership to you.',
      'Content you upload remains yours, and you grant us permission to host and display it in order to provide the service.',
    ] },
  },
  {
    ar: { t: 'بيانات الضيوف والخصوصية', b: [
      'لما ضيوفك بيأكّدوا حضورهم، بنجمع البيانات اللي بيدخلوها (زي الاسم والرد) ونعرضهالك إنت صاحب الدعوة. إنت مسؤول عن استخدام بيانات ضيوفك بشكل يحترم خصوصيتهم.',
      'إحنا بنحمي البيانات بإجراءات معقولة، بس مفيش نظام على الإنترنت آمن ١٠٠٪. لينك تقرير الإحصائيات اللي بتشاركه إنت مسؤول عن مين بتديله.',
    ] },
    en: { t: 'Guest data & privacy', b: [
      'When your guests RSVP, we collect the data they enter (such as name and reply) and show it to you, the invitation owner. You are responsible for using your guests’ data in a way that respects their privacy.',
      'We protect data with reasonable measures, but no system on the internet is 100% secure. You are responsible for whom you share your statistics report link with.',
    ] },
  },
  {
    ar: { t: 'التوفّر وإخلاء المسؤولية', b: [
      'بنبذل مجهود معقول عشان الخدمة تفضل متاحة وشغّالة، بس بنقدّمها "كما هي" من غير ضمانات إنها هتشتغل من غير أي انقطاع أو خطأ.',
      'ميثاق مش مسؤول عن أي خسارة غير مباشرة أو تبعية. ومسؤوليتنا في كل الأحوال مابتزيدش عن المبلغ اللي دفعته لنا في آخر ١٢ شهر.',
    ] },
    en: { t: 'Availability & disclaimer', b: [
      'We make reasonable efforts to keep the service available and working, but we provide it “as is” without warranties that it will run without interruption or error.',
      'Mithaq is not liable for any indirect or consequential loss. In all cases our liability does not exceed the amount you paid us in the last 12 months.',
    ] },
  },
  {
    ar: { t: 'تعديل الشروط والقانون الحاكم', b: [
      'ممكن نحدّث الشروط دي من وقت للتاني، والنسخة المنشورة هنا هي السارية. استمرارك في استخدام الخدمة بعد التحديث معناه موافقتك.',
      'الشروط دي بتخضع لقوانين جمهورية مصر العربية. لأي استفسار أو شكوى تواصل معانا وهنرد عليك.',
    ] },
    en: { t: 'Changes & governing law', b: [
      'We may update these terms from time to time; the version published here is the one in force. Continuing to use the service after an update means you accept it.',
      'These terms are governed by the laws of the Arab Republic of Egypt. For any question or complaint, contact us and we will respond.',
    ] },
  },
];

export default function TermsPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-6 sm:pt-12">
        <Link to="/" className="mb-7 inline-flex items-center gap-1.5 text-[13px] text-ink-dim hover:text-rose">
          <ArrowRight size={15} className={isAr ? '' : 'rotate-180'} />
          {isAr ? 'الرئيسية' : 'Home'}
        </Link>

        <div className="mb-8 border-b border-line pb-7">
          <div className="mb-3 inline-flex items-center justify-center rounded-2xl bg-night p-2.5 text-brass-soft">
            <ScrollText size={20} />
          </div>
          <h1 className="font-serif text-[28px] font-bold text-ink sm:text-[34px]">
            {isAr ? 'شروط الاستخدام' : 'Terms of Service'}
          </h1>
          <p className="mt-2 text-[13px] text-ink-dim">
            {isAr ? `آخر تحديث: ${UPDATED.ar}` : `Last updated: ${UPDATED.en}`}
          </p>
        </div>

        <div className="space-y-7">
          {SECTIONS.map((s, i) => {
            const sec = s[lang];
            return (
              <section key={sec.t}>
                <h2 className="mb-2.5 font-serif text-[18px] font-bold text-ink sm:text-[20px]">
                  <span className="text-brass">{isAr ? `${i + 1}. ` : `${i + 1}. `}</span>
                  {sec.t}
                </h2>
                <div className="space-y-2.5">
                  {sec.b.map((p, j) => (
                    <p key={j} className="text-[14px] leading-[1.95] text-ink-dim">{p}</p>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-line bg-card p-5 text-center">
          <p className="text-[13.5px] text-ink-dim">
            {isAr ? 'عندك سؤال عن الشروط دي؟' : 'A question about these terms?'}
          </p>
          <a
            href={whatsappLink(isAr ? 'عندي سؤال عن شروط الاستخدام' : 'I have a question about the Terms of Service')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-night px-6 py-2.5 text-[13px] font-bold text-ivory hover:bg-emerald"
          >
            {isAr ? 'تواصل معنا' : 'Contact us'}
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}

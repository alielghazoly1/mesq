// حاجز أخطاء محلي لجزء واحد من الصفحة (زي الشريط الجانبي في المحرر).
//
// الفرق عن ErrorBoundary العام: الخطأ هنا مايوقعش الصفحة كلها. الجزء ده
// بس بيعرض رسالة صغيرة، والمحرر والدعوة بيفضلوا شغالين وتعديلات العميل
// زي ما هي. وأول ما resetKey يتغيّر (العميل اختار عنصر تاني أو بدّل
// التبويب) الجزء بيرجع لوحده من غير ريفرش.
// السبب بيتبعت للسيرفر (lib/reportError.js) عشان يبان في لوحة التحكم.
import { Component } from 'react';
import { reportError } from '../lib/reportError.js';

export default class PanelBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('خطأ في جزء من الصفحة:', error, info && info.componentStack);
    reportError(error, {
      where: this.props.where || 'panel',
      componentStack: info && info.componentStack,
      context: this.props.context || '',
    });
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="rounded-2xl border border-line bg-ivory/60 p-4 text-center">
        <p className="text-[13px] font-bold text-ink">{this.props.title || 'حصل خطأ بسيط في الجزء ده'}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-dim">
          {this.props.hint || 'تعديلاتك محفوظة. اضغط على أي جزء في الدعوة تاني، أو جرّب الزرار ده.'}
        </p>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="mt-3 rounded-full bg-night px-4 py-2 text-[12px] font-bold text-ivory hover:bg-emerald"
        >
          {this.props.retryLabel || 'جرّب تاني'}
        </button>
      </div>
    );
  }
}

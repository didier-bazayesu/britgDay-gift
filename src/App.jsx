import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

const BIRTHDAY_NAME  = "Didier";
const WHATSAPP_PHONE = "250790213746";
const MOMO_CODE      = "741925";
const PRESET_AMOUNTS = [1000, 2000, 5000, 10000];

const haptic = (ms = 50) => navigator.vibrate?.(ms);

function buildMessage(name, wish, amount) {
  const giftLine = amount ? `\n\n🎁 *Gift Amount:* RWF ${Number(amount).toLocaleString()}` : "";
  return `🎂 *Happy Birthday, ${BIRTHDAY_NAME}!*\n\nFrom: *${name.trim()}*${wish.trim() ? `\n\n💌 ${wish.trim()}` : ""}${giftLine}\n\n🎉 Wishing you an amazing day!`;
}

function Confetti() {
  const pieces = Array.from({ length: 48 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2.5}s`,
    animationDuration: `${2.8 + Math.random() * 2}s`,
    background: ["#ff6b9d","#ffd700","#7c3aed","#00d4aa","#ff8c42","#4fc3f7"][i % 6],
    width:  `${6 + Math.random() * 8}px`,
    height: `${6 + Math.random() * 8}px`,
    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
  }));
  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((s, i) => <div key={i} className="confetti-piece" style={s} />)}
    </div>
  );
}

function PreviewModal({ name, wish, amount, onConfirm, onClose }) {
  const preview = buildMessage(name, wish, amount);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span>📋 Message Preview</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <pre className="preview-text">{preview}</pre>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>✏️ Edit</button>
          <button className="btn-confirm" onClick={onConfirm}>
            Send via WhatsApp
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.534 5.855L0 24l6.335-1.513A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.382l-.36-.214-3.732.891.923-3.646-.235-.375A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep]           = useState("form");
  const [name, setName]           = useState("");
  const [wish, setWish]           = useState("");
  const [amount, setAmount]       = useState("");
  const [countdown, setCountdown] = useState(10);
  const [nameError, setNameError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [waUrl, setWaUrl]         = useState("");
  const timerRef = useRef(null);

  const handlePreview = () => {
    if (!name.trim()) { setNameError("Please enter your name 😊"); return; }
    setNameError("");
    haptic(40);
    setShowPreview(true);
  };

  const confirmSend = useCallback(() => {
    if (sending) return;
    setSending(true);
    haptic(60);
    const text = buildMessage(name, wish, amount);
    const url  = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
    setWaUrl(url);
    setShowPreview(false);
    if (amount) {
      const dialCode = `*182*8*1*${MOMO_CODE}*${amount}%23`;
      window.location.href = `tel:${dialCode}`;
      setStep("whatsapp");
    } else {
      window.open(url, "_blank");
      setStep("done");
    }
  }, [sending, name, wish, amount]);

  useEffect(() => {
    if (step !== "whatsapp") return;
    let count = 20;
    setCountdown(20);
    timerRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timerRef.current);
        window.open(waUrl, "_blank");
        setStep("done");
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  const skipTimer = () => {
    clearInterval(timerRef.current);
    haptic(80);
    window.open(waUrl, "_blank");
    setStep("done");
  };

  const copyLink = async () => {
    haptic(40);
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const el = document.createElement("input");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const reset = () => {
    setStep("form"); setName(""); setWish("");
    setAmount(""); setCountdown(10); setSending(false);
  };

  const selectPreset = (val) => {
    haptic(30);
    setAmount(amount === String(val) ? "" : String(val));
  };

  return (
    <div className="app">
      <div className="bg-orbs" aria-hidden="true">
        <div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>
      </div>

      {/* share bar */}
      <button className="share-bar" onClick={copyLink}>
        {copied
          ? <><span className="share-icon">✓</span> Link copied!</>
          : <><span className="share-icon">🔗</span> Share {BIRTHDAY_NAME}'s page</>}
      </button>

      {/* ── FORM ── */}
      {step === "form" && (
        <div className="card animate-in">
          <div className="card-header">
            <div className="cake-icon">🎂</div>
            <h1>It's {BIRTHDAY_NAME}'s<br/>Birthday!</h1>
            <p className="subtitle">Send a wish — or a gift — in seconds 🎁</p>
          </div>

          <div className="form">
            <div className="field">
              <label>Your Name <span className="required">*</span></label>
              <input
                type="text"
                placeholder="e.g. Alice"
                value={name}
                onChange={e => { setName(e.target.value); setNameError(""); }}
                className={nameError ? "error" : ""}
                autoComplete="given-name"
              />
              {nameError && <span className="field-error">{nameError}</span>}
            </div>

            <div className="field">
              <label>Birthday Message <span className="optional">(optional)</span></label>
              <textarea
                placeholder={`Write something heartfelt for ${BIRTHDAY_NAME}... 💌`}
                value={wish}
                onChange={e => setWish(e.target.value)}
                rows={3}
              />
            </div>

            <div className="field">
              <label>Gift Amount in RWF <span className="optional">(optional)</span></label>
              <div className="preset-pills">
                {PRESET_AMOUNTS.map(v => (
                  <button
                    key={v}
                    className={`pill${amount === String(v) ? " pill-active" : ""}`}
                    onClick={() => selectPreset(v)}
                    type="button"
                  >
                    {v.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="amount-wrap">
                <span className="currency">RWF</span>
                <input
                  type="number"
                  placeholder="it's optional"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="0"
                />
              </div>
              {amount && <span className="hint">💡 MoMo payment dial launches befre  WhatsApp comes and send message </span>}
            </div>

            <button className="btn-send" onClick={handlePreview} disabled={sending}>
              <span>Preview &amp; Send via WhatsApp</span>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.534 5.855L0 24l6.335-1.513A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.382l-.36-.214-3.732.891.923-3.646-.235-.375A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── WHATSAPP WAITING ── */}
      {step === "whatsapp" && (
        <div className="card animate-in center">
          <Confetti />
          <div className="big-emoji">📞</div>
          <h2>MoMo Dialing…</h2>
          <p className="subtitle">Complete the MoMo payment on your phone.</p>
          <p className="momo-code-preview">Dial: <code>*182*8*1*{MOMO_CODE}*{amount}#</code></p>

          <div className="timer-ring">
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" className="ring-bg"/>
              <circle cx="40" cy="40" r="34" className="ring-fill"
                style={{ strokeDashoffset: 213.6 - (213.6 * countdown / 20) }}/>
            </svg>
            <span className="timer-num">{countdown}</span>
          </div>
          <p className="timer-label">WhatsApp opens automatically in <strong>{countdown}s</strong></p>

          <a className="btn-wa-fallback" href={waUrl} target="_blank" rel="noreferrer">
            Open WhatsApp now ↗
          </a>
          <button className="btn-skip" onClick={skipTimer}>Skip to WhatsApp →</button>
        </div>
      )}

            {/* ── DONE ── */}
      {step === "done" && (
        <div className="card animate-in center">
          <Confetti />
          <div className="big-emoji">🥳</div>
          <h2>All Done!</h2>
          <p className="subtitle">
            {amount
              ? `${BIRTHDAY_NAME} will love your wish & gift! 🎁`
              : `${BIRTHDAY_NAME} will love your birthday wish! 💌`}
          </p>
          <button className="btn-send" onClick={reset}>Send Another →</button>
          <button className="btn-ghost-full" onClick={copyLink}>
            {copied ? "✓ Link Copied!" : "🔗 Share this page"}
          </button>
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {showPreview && (
        <PreviewModal
          name={name} wish={wish} amount={amount}
          onConfirm={confirmSend}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Mail, RefreshCw, CheckCircle2 } from 'lucide-react';

const OtpInput = ({ email, onOtpChange, onResend, sending, initialTimer = 30 }) => {
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(initialTimer);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    // Resend countdown timer
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            setCanResend(false);
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Handle digit input change
    const handleChange = (index, value) => {
        const val = value.replace(/\D/g, ''); // numbers only
        if (!val) {
            const newDigits = [...digits];
            newDigits[index] = '';
            setDigits(newDigits);
            onOtpChange(newDigits.join(''));
            return;
        }

        // Take last entered character if single char entered
        const char = val.slice(-1);
        const newDigits = [...digits];
        newDigits[index] = char;
        setDigits(newDigits);
        onOtpChange(newDigits.join(''));

        // Auto move focus to next box
        if (index < 5 && char) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace key navigation
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    // Handle paste event (e.g. user pastes 6-digit code)
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData) {
            const newDigits = [...digits];
            for (let i = 0; i < 6; i++) {
                newDigits[i] = pastedData[i] || '';
            }
            setDigits(newDigits);
            onOtpChange(newDigits.join(''));
            // Focus on last box or next empty box
            const nextFocusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[nextFocusIndex]?.focus();
        }
    };

    const handleResendClick = () => {
        if (canResend && !sending) {
            onResend();
            setTimer(initialTimer);
            setCanResend(false);
            setDigits(['', '', '', '', '', '']);
            onOtpChange('');
            inputRefs.current[0]?.focus();
        }
    };

    const isComplete = digits.join('').length === 6;

    return (
        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-5 shadow-xs transition-all space-y-4">
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-indigo-950 font-bold">
                    <Mail size={16} className="text-indigo-600" />
                    <span>Enter 6-Digit Security Code</span>
                </div>
                {isComplete && (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full text-[11px]">
                        <CheckCircle2 size={12} /> Code Ready
                    </span>
                )}
            </div>

            <p className="text-[12px] text-slate-600 font-medium">
                A verification code was sent to <strong className="text-slate-900">{email}</strong>
            </p>

            {/* 6 Square Box Pin Inputs */}
            <div className="flex justify-between items-center gap-2 sm:gap-3 py-1">
                {digits.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border transition-all duration-200 focus:outline-none ${
                            digit
                                ? 'border-indigo-600 bg-white text-indigo-900 shadow-xs ring-2 ring-indigo-500/20'
                                : 'border-slate-300 bg-white/90 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'
                        }`}
                    />
                ))}
            </div>

            {/* Resend OTP & Helper Info */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-indigo-100">
                <span className="text-slate-500 text-[11px]">Didn't receive the code?</span>
                <button
                    type="button"
                    onClick={handleResendClick}
                    disabled={!canResend || sending}
                    className={`font-semibold transition-all flex items-center gap-1 ${
                        canResend && !sending
                            ? 'text-indigo-600 hover:text-indigo-800 cursor-pointer underline'
                            : 'text-slate-400 cursor-not-allowed'
                    }`}
                >
                    <RefreshCw size={12} className={sending ? 'animate-spin' : ''} />
                    {sending
                        ? 'Sending...'
                        : canResend
                        ? 'Resend OTP'
                        : `Resend in ${timer}s`}
                </button>
            </div>
        </div>
    );
};

export default OtpInput;

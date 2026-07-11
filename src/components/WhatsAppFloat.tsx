const WHATSAPP_NUMBER = "5531993040342";
const DEFAULT_MESSAGE = "Olá! Vim pelo site e gostaria de mais informações.";

export function WhatsAppFloat() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco no WhatsApp (abre em nova aba)"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 ring-1 ring-black/5 transition hover:scale-105 hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:h-16 sm:w-16"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        focusable="false"
        className="h-7 w-7 sm:h-8 sm:w-8"
        fill="currentColor"
      >
        <path d="M19.11 17.35c-.29-.14-1.7-.84-1.97-.93-.26-.1-.46-.14-.65.14-.19.29-.74.93-.91 1.13-.17.19-.33.22-.62.07-.29-.14-1.22-.45-2.32-1.43-.86-.77-1.44-1.71-1.61-2s-.02-.44.13-.59c.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.65-1.57-.9-2.15-.24-.57-.48-.49-.65-.5l-.55-.01c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.4s1.03 2.78 1.17 2.98c.14.19 2.02 3.08 4.9 4.32.68.29 1.22.47 1.64.6.69.22 1.31.19 1.81.11.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.24.17-1.37-.07-.13-.26-.19-.55-.34zM16.02 5.33c-5.9 0-10.7 4.8-10.7 10.7 0 1.88.49 3.72 1.43 5.34L5.24 26.7l5.48-1.44a10.66 10.66 0 0 0 5.3 1.42h.01c5.9 0 10.7-4.8 10.7-10.7 0-2.86-1.11-5.55-3.13-7.57a10.63 10.63 0 0 0-7.58-3.08zm0 19.51h-.01a8.85 8.85 0 0 1-4.51-1.24l-.32-.19-3.25.85.87-3.17-.21-.33a8.87 8.87 0 0 1-1.36-4.73c0-4.9 3.99-8.89 8.9-8.89a8.85 8.85 0 0 1 6.29 2.61 8.85 8.85 0 0 1 2.6 6.29c0 4.9-3.99 8.89-8.9 8.89z" />
      </svg>
    </a>
  );
}

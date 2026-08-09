export default function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (window as any).Razorpay !== "undefined") return resolve();

    const existing = document.querySelector("script[data-razorpay]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Razorpay script")),
      );
      return;
    }

    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.setAttribute("data-razorpay", "true");
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Razorpay script failed to load"));
    document.head.appendChild(s);
  });
}

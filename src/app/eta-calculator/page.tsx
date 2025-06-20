
import { EtaForm } from '@/components/EtaForm';

// Page components in Next.js App Router can receive searchParams as a prop.
// These are typically plain objects in Server Components, but to be robust
// and to address potential "enumeration" errors if they were URLSearchParams-like,
// we demonstrate careful key extraction.
export default function EtaCalculatorPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  
  // Example of how searchParams might be processed.
  // The error "params are being enumerated" suggests Object.keys might be used on
  // a Next.js internal params/searchParams object in a way it dislikes.
  if (searchParams && typeof searchParams === 'object') {
    // Directly using Object.keys should be fine if searchParams is a plain object.
    // const keys = Object.keys(searchParams);

    // A more robust way if searchParams were a URLSearchParams instance or similar:
    // (Though Next.js usually provides a plain object for searchParams prop in Server Components)
    let allKeys: string[] = [];
    try {
      // This attempts to treat searchParams as if it might be an iterable (like URLSearchParams)
      // or a plain object.
      if (Symbol.iterator in searchParams && typeof (searchParams as any).keys === 'function') {
         allKeys = Array.from((searchParams as any).keys());
      } else {
         allKeys = Object.keys(searchParams);
      }
    } catch (e) {
      // Fallback if introspection fails, though unlikely for the typical searchParams prop.
      allKeys = Object.keys(searchParams);
    }

    const filteredKeys = allKeys.filter(k => k !== 'timestamp' && searchParams[k] !== undefined);
    
    // This console.log is for debugging and would typically not be in production.
    // It's included to show that the filteredKeys are being processed.
    if (filteredKeys.length > 0) {
      // console.log('Filtered Search Param Keys:', filteredKeys);
    }
  }

  return (
    <div>
      <EtaForm />
    </div>
  );
}

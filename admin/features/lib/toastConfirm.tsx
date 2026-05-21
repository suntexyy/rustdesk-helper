import toast from "react-hot-toast";
import { ReactNode } from "react";

/**
 * Show a toast with Yes/No buttons and resolve a promise with the result.
 * The toast remains until the user makes a choice or it is manually dismissed.
 */
export function confirmToast(message: ReactNode): Promise<boolean> {
  return new Promise((resolve) => {
    const id = toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <div>{message}</div>
          <div className="flex gap-2 justify-end">
            <button
              className="px-2 py-1 text-xs font-semibold bg-gray-200 rounded"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
            >
              Cancel
            </button>
            <button
              className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
      },
    );
  });
}

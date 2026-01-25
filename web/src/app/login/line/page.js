// "use client";

// import { useEffect, useRef } from "react";
// import liff from "@line/liff";

// const LIFF_ID = "2007854586-9ogoEj2j";

// export default function LineLoginPage() {
//   const calledRef = useRef(false);

//   useEffect(() => {
//     const run = async () => {
//       try {
//         await liff.init({ liffId: LIFF_ID });

//         // เปิดนอก LINE
//         if (!liff.isInClient()) {
//           console.warn("Not in LINE client");
//           return;
//         }

//         // ยังไม่ login → เด้งไป login
//         if (!liff.isLoggedIn()) {
//           liff.login();
//           return;
//         }

//         // กันยิงซ้ำ
//         if (calledRef.current) return;
//         calledRef.current = true;

//         const accessToken = liff.getAccessToken();

//         const res = await fetch(
//           "https://smart-paddy.space/api/auth/line-oa-login",
//           {
//             method: "POST",
//             credentials: "include",
//             headers: { "Content-Type": "application/json" },
//             body: {
//               accessToken: accessToken,
//             }
//           }
//         );

//         console.log("LINE OA Login response:", res);

//           // สำเร็จ → ปิด LIFF
//           liff.closeWindow();
      
//       } catch (err) {
//         console.error("LIFF error:", err);
//         liff.closeWindow();
//       }
//     };

//     run();
//   }, []);

//   return (
//     <div className="flex h-screen flex-col items-center justify-center gap-4">
//       <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent" />
//       <p className="text-gray-600 text-lg">
//         กำลังเข้าสู่ระบบด้วย LINE...
//       </p>
//       <p className="text-sm text-gray-400">
//         หน้านี้จะปิดอัตโนมัติ
//       </p>
//     </div>
//   );
// }

"use client";
import { useEffect, useRef } from "react";
import liff from "@line/liff";

const LIFF_ID = "2007854586-9ogoEj2j";

export default function LineLoginPage() {
  const calledRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });

        if (!liff.isInClient()) {
          window.location.href =
            "https://access.line.me/oauth2/v2.1/authorize" +
            "?response_type=code" +
            "&client_id=2007854586" +
            "&redirect_uri=https://smart-paddy.space/login/line" +
            "&scope=profile%20openid" +
            "&state=login";
          return;
        }

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        if (calledRef.current) return;
        calledRef.current = true;

        const accessToken = liff.getAccessToken();

        const res = await fetch(
          "https://smart-paddy.space/api/auth/line-oa-login",
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: {
              accessToken: accessToken,
            }
          }
        );

        console.log("LINE OA Login response:", res);
        if (res.ok) {
          liff.closeWindow();
        }
      } catch (err) {
        console.error("LIFF login error:", err);
        liff.closeWindow();
      }
    };

    run();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      กำลังเข้าสู่ระบบด้วย LINE...
    </div>
  );
}

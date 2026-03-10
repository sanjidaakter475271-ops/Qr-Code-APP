import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

export default function Test() {
  const ref = useRef(null);
  useEffect(() => {
    const qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      data: "https://qr.io",
      dotsOptions: {
        color: "#4267b2",
        type: "rounded"
      },
      cornersSquareOptions: {
        type: "extra-rounded"
      }
    });
    qrCode.append(ref.current);
  }, []);
  return <div ref={ref} />;
}

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const ICON = 'https://cdn.calibrestudio.co/Branding/CALIBRE-ICON-BLK.png';
const WORDMARK = 'https://cdn.calibrestudio.co/Branding/Calibre_Studio-logo.png';
// Exact same typefaces the sibling landing pages use for their OG cards.
const REGULAR = 'https://raw.githubusercontent.com/Calibre-Studio/getfound-site/main/app/og-regular.ttf';
const BOLD = 'https://raw.githubusercontent.com/Calibre-Studio/getfound-site/main/app/og-bold.ttf';

export default async function handler() {
  const [regular, bold] = await Promise.all([
    fetch(REGULAR).then((r) => r.arrayBuffer()),
    fetch(BOLD).then((r) => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          position: 'relative',
          fontFamily: 'Sans',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 8, backgroundColor: '#000000' }} />

        <div style={{ display: 'flex', alignItems: 'center', marginTop: 100, marginLeft: 80 }}>
          <img src={ICON} width={26} height={26} style={{ width: 26, height: 26, objectFit: 'contain' }} />
          <div style={{ display: 'flex', marginLeft: 24, fontSize: 28, letterSpacing: 18, color: '#6e6e6e', fontWeight: 400 }}>
            CHATGPT ADS
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 48, marginLeft: 80, fontSize: 96, fontWeight: 700, color: '#000000', lineHeight: 1.05, letterSpacing: -3 }}>
          <div style={{ display: 'flex' }}>Be the answer</div>
          <div style={{ display: 'flex' }}>inside ChatGPT.</div>
        </div>

        <div style={{ position: 'absolute', left: 80, bottom: 58, width: 1040, display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(0,0,0,0.14)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 30 }}>
            <div style={{ display: 'flex', fontSize: 25, color: '#000000' }}>ads.calibrestudio.co</div>
            <img
              src={WORDMARK}
              width={320}
              height={40}
              style={{ width: 320, height: 40, objectFit: 'contain', objectPosition: 'right center' }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Sans', data: regular, weight: 400, style: 'normal' },
        { name: 'Sans', data: bold, weight: 700, style: 'normal' },
      ],
    }
  );
}

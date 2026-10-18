// Filter som ger konturerna en handritad, lite ojämn form. Läggs bara på stillastående delar:
// i fas 0 sjönk WebKit från 59 till cirka 43 bilder per sekund när filtret låg över rörliga delar.
export default function HandritadFilter({ id = 'handritad', styrka }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" result="brus" />
      <feDisplacementMap in="SourceGraphic" in2="brus" scale={styrka} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
}

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Loading.css';

type Props = {
  message?: string;
};

function Loading(props: Props) {
  const [counter, setCounter] = useState<number>(50);
  const { t } = useTranslation();

  useEffect(() => {
    let timer: number;

    if (counter < -55) {
      timer = setTimeout(() => {
        setCounter(50);
      }, 1000);
    } else {
      timer = setTimeout(() => {
        setCounter(counter - 4);
      }, 500);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [counter]);

  return (
    <>
      <div
        style={{
          height: 150,
          marginTop: 10,
          marginBottom: 10,
          position: 'relative',
        }}
      >
        <div className="circle">
          <div className="wave">
            <div className="wave-before" style={{ top: `${counter}%` }} />
            <div className="wave-after" style={{ top: `${counter}%` }} />
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 30,
          fontSize: 15,
          color: '#1c1c1c',
        }}
      >
        {t('Loading.Maximum')}
        <br />
        {t('Loading.PleaseWait')}
      </div>
    </>
  );
}

export default Loading;

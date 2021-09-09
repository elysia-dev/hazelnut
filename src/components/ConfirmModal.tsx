import React from 'react';

type Props = {
  list?: { label: string; value: string; subvalue?: string }[];
};

const ConfirmModal: React.FC<Props> = ({ list }) => {
  return (
    <>
      {' '}
      <div
        style={{
          fontSize: 18,
          color: 'black',
          textAlign: 'center',
          fontFamily: 'Spoqa Han Sans',
          fontWeight: 'bold',
          borderBottom: '1px solid #F1F1F1',
          alignItems: 'center',
          marginTop: 35,
          height: 40,
        }}
      >
        구매 전 최종 금액을 확인해 주세요!
      </div>
      {list?.map(item => {
        return (
          <div
            key={item.label}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottom: '1px solid #F1F1F1',
              alignItems: 'center',
              height: item.subvalue ? 64 : 50,
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: 'black',
                fontFamily: 'Spoqa Han Sans',
              }}
            >
              {item.label}
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  color: 'black',
                  textAlign: 'right',
                  fontFamily: 'Spoqa Han Sans',
                  fontWeight: 'bold',
                }}
              >
                {item.value}
              </div>
              {item.subvalue && (
                <div
                  style={{
                    fontSize: 12,
                    color: 'black',
                    textAlign: 'right',
                    fontFamily: 'Spoqa Han Sans',
                  }}
                >
                  {item.subvalue}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ConfirmModal;

import React from 'react';

interface Props {
  list: { label: string; value: string; subvalue?: string }[];
}

const ConfirmationList: React.FC<Props> = ({
  list,
}) => {

  return (
    <div
      style={{
        border: '1px solid #F1F1F1',
        borderRadius: '10px 10px 5px 5px',
      }}>
      <div
        style={{
          height: 50,
          backgroundColor: '#F4F4F4',
          fontSize: 17,
          color: '#1C1C1C',
          borderRadius: '10px 10px 0px 0px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Spoqa Han Sans',
          fontWeight: 500,
        }}>
        최종 확인을 해주세요!
      </div>
      {list.map((item) => {
        return (
          <div
            key={item.label}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: item.subvalue ? 64 : 50,
              padding: '0px 16px',
              borderTop: '1px solid #F1F1F1',
            }}>
            <div
              style={{
                fontSize: 14,
                color: '#848484',
                fontFamily: 'Spoqa Han Sans',
              }}>
              {item.label}
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  color: '#1C1C1C',
                  textAlign: 'right',
                  fontFamily: 'Spoqa Han Sans',
                  fontWeight: 500,
                  marginBottom: 2,
                }}>
                {item.value}
              </div>
              {item.subvalue && (
                <div
                  style={{
                    fontSize: 12,
                    color: '#848484',
                    textAlign: 'right',
                    fontFamily: 'Spoqa Han Sans',
                  }}>
                  {item.subvalue}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConfirmationList;

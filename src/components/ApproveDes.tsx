import React from 'react';

function ApproveDes() {
  return (
    <div
      style={{
        alignItems: 'center',
        marginTop: 57,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontFamily: 'Spoqa Han Sans',
          fontWeight: 'bold',
        }}
      >
        접근 권한을 승인해주세요!
      </div>
      <div
        style={{
          width: '100%',
          borderTopWidth: 1,
          borderColor: 'gray',
          marginTop: 15,
          marginBottom: 29,
        }}
      />
      <div
        style={{
          fontSize: 14,
          color: 'black',
          textAlign: 'center',
          marginBottom: 26,
          fontFamily: 'Spoqa Han Sans',
        }}
      >
        부동산 토큰을 구매하기 위해서는 연결된 지갑에 해당 앱이 접근할 수 있도록
        접근 권한을 승인해야 합니다.
      </div>
      <div
        style={{
          fontSize: 14,
          color: 'black',
          textAlign: 'center',
          fontFamily: 'Spoqa Han Sans',
        }}
      >
        최초 구매 시에만 승인이 필요하며, 승인이 성공적으로 완료될 경우, 이후의
        거래에는 권한 승인 없이 부동산 토큰을 구매하실 수 있습니다.
      </div>
    </div>
  );
}

export default ApproveDes;

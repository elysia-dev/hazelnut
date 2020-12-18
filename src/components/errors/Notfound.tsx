import React from 'react';
import Loading from '../Loading';

function NotFound() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '30%',
      }}
    >
      <img
        src={require('../../images/notFound.png')}
        srcSet={`${require('../../images/notFound@2x.png')} 2x, ${require('../../images/notFound@3x.png')} 3x`}
        style={{
          alignSelf: 'center',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      />
    </div>
  );
}

export default NotFound;

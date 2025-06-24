function getColor(verdict) {
  if (!verdict) return '#888';
  if (verdict.toLowerCase().includes('accept')) return '#2e7d32';
  if (verdict.toLowerCase().includes('wrong') || verdict.toLowerCase().includes('error')) return '#d32f2f';
  return '#ffa116';
}

function Verdict({ verdict }) {
  return (
    <div
      className="verdict"
      style={{
        background: '#f5f7fa',
        color: getColor(verdict),
        padding: '10px 18px',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: '1.08rem',
        marginTop: 16,
        marginBottom: 8,
        minHeight: 32,
        textAlign: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}
    >
      {verdict || 'Verdict will appear here.'}
    </div>
  );
}

export default Verdict; 
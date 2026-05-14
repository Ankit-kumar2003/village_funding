export default function IndianCurrency({ amount }) {
  return (
    <span>
      {new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount)}
    </span>
  );
}

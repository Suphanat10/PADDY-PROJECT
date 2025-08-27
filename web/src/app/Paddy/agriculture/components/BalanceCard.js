export default function BalanceCard({ title, amount, color }) {
  const colorClasses = {
    green: {
      title: "text-green-600",  
      amount: "text-green-800",
      text: "text-green-500"  
    },
    blue: { 
      title: "text-blue-600",
      amount: "text-blue-800",
      text: "text-blue-500"
    },
    red: {
      title: "text-red-600",
      amount: "text-red-800",
      text: "text-red-500"
    },
    gray: {
      title: "text-gray-600",
      amount: "text-gray-800",
      text: "text-gray-500"
    }
  };

  const selectedColor = colorClasses[color] || colorClasses.gray;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
      <h3 className={`${selectedColor.title} font-medium text-base sm:text-lg mb-3 sm:mb-4`}>
        {title}
      </h3>
      <div className={`${selectedColor.amount} text-2xl sm:text-3xl lg:text-4xl font-bold mb-2`}>
        {amount}
        <span className={`text-sm sm:text-base lg:text-lg font-normal ${selectedColor.text} ml-1 sm:ml-2`}>
          เครื่อง 
        </span>
      </div>
    </div>
  );
}
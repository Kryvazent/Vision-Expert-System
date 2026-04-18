import{
  DollarOutlined,
  ShoppingOutlined,
  WalletOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { c } from '@apollo/client/react/internal/compiler-runtime';



const iconStyle = { color: "#3B82F6", fontSize: 40 };


export const icons = {

    shopping: <ShoppingOutlined style={iconStyle} />,
      dollar: <DollarOutlined style={iconStyle}  />,
      wallet: <WalletOutlined style={iconStyle} />,
      creditcard: <CreditCardOutlined style={iconStyle} />,
      clock: <ClockCircleOutlined style={iconStyle} />,
      check: <CheckCircleOutlined style={iconStyle} />,
      trophy: <TrophyOutlined style={iconStyle} />,





}

function AccountantIcons({icontype = "shopping"}) {
    return icons[icontype] || icons.shopping;
   

}

export default AccountantIcons;
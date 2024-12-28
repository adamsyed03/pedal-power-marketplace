import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductCardProps {
  title: string;
  price: number;
  image: string;
  description: string;
}

export const ProductCard = ({ title, price, image, description }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <p className="text-gray-600 mb-4">{description}</p>
        <p className="text-2xl font-bold text-primary">${price.toLocaleString()}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  );
};
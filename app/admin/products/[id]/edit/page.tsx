import ProductEditLoader from "@/components/admin/ProductEditLoader"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductEditLoader id={id} />
}

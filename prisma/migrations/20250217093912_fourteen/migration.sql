-- CreateTable
CREATE TABLE "BannerCarousel" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "href" TEXT NOT NULL,

    CONSTRAINT "BannerCarousel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCarousel" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductCarousel_pkey" PRIMARY KEY ("id")
);

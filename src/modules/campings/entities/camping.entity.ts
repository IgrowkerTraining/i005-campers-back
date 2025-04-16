import { Prisma } from '@prisma/client';

export const campingWithDetails = Prisma.validator<Prisma.CampingDefaultArgs>()({
  include: {
    amenities: true,
    location: true,
    pricing: true,
    nearbyAttractions: true,
  },
});

export type CampingWithDetails = Prisma.CampingGetPayload<typeof campingWithDetails>;

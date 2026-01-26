import { useLocalStorage } from './useLocalStorage';
import type { UserProfile } from '@/types';

const defaultProfile: UserProfile = {
  id: '1',
  username: 'User',
  email: 'user@example.com',
  profilePicture: 'https://scontent.fbkk7-3.fna.fbcdn.net/v/t51.82787-15/589646082_18087330131472960_5072594401506913898_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFPWG5vzmc11ZNoANyL3UNJ7ZL2ydfFJAPtkvbJ18UkAyMEia28EhHijkvONQYl9cWD_7zDZXOAP6QAxXARA8hq&_nc_ohc=tK_yw3xZfwIQ7kNvwERgalb&_nc_oc=AdnzOp6W5NNuYkEk6uP6Shq0GBUMgEfFseS11wmDs_4bfsiFm-EjhAqwvD1lpTFhJYI&_nc_zt=23&_nc_ht=scontent.fbkk7-3.fna&_nc_gid=sj_bjzPEz7XS2uNxmtGodA&oh=00_AfpedPlzTjmUqbqHmWl9V4A_TUTGBBAKYVc_EwzdPLHwvA&oe=6978CAA3',
  createdAt: new Date().toISOString(),
};

export function useProfile() {
  const [profile, setProfile] = useLocalStorage<UserProfile>('eyetracktask-user-profile', defaultProfile);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const updateProfilePicture = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Create image element to load and resize
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Set max dimensions (reduce storage size)
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        // Set canvas dimensions and draw resized image
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression (0.7 quality for JPEG)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        // Check size (rough estimate: base64 is ~1.37x original)
        const sizeInKB = (compressedBase64.length * 0.75) / 1024;
        
        if (sizeInKB > 500) {
          // Try even more compression
          const moreCompressed = canvas.toDataURL('image/jpeg', 0.5);
          updateProfile({ profilePicture: moreCompressed });
        } else {
          updateProfile({ profilePicture: compressedBase64 });
        }
        
        resolve();
      };

      img.onerror = () => reject(new Error('Failed to load image'));

      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    profile,
    updateProfile,
    updateProfilePicture,
  };
}

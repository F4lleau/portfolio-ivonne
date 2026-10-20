import { useMutation } from '@tanstack/react-query';
import { sendContact } from './service';
export const useSendContact = () => useMutation({ mutationFn: sendContact });

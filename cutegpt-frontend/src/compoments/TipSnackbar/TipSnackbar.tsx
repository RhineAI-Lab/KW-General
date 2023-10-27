import {forwardRef} from "react";
import {CustomContentProps} from "notistack";

export const TipSnackbar = forwardRef<HTMLDivElement, TipSnackbarProps> (
  ({ id, ...props }, ref) => {
  return <div ref={ref}>
    {props.message}
  </div>
})

export interface TipSnackbarProps extends CustomContentProps {
  type: string
}

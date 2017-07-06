-- sprite.out generator

import Codec.Picture
import qualified Data.Vector as V

col :: PixelRGB8 -> Int
col (PixelRGB8 0xff 0xff 0x00) = 0
col (PixelRGB8 0xff 0xaa 0xaa) = 1
col (PixelRGB8 0x00 0x00 0xff) = 2
col (PixelRGB8 0xff 0xff 0xff) = 3
col (PixelRGB8 0xff 0x00 0x00) = 4
col (PixelRGB8 0xff 0xaa 0x55) = 5
col (PixelRGB8 0xff 0xaa 0xff) = 6
col (PixelRGB8 0x00 0xff 0xff) = 7
col (PixelRGB8 0x00 0x00 0x00) = 8
col x = error $ show x

main :: IO ()
main = do
  i' <- readImage "sprite.png"
  case i' of
    Left _ -> putStrLn "Image not found (sprite.png)"
    Right i -> let
        img =   convertRGB8 i
        seqs = [ [ [ (px+x*16, py+y*16) | px <- [0..15] ] | py <- [0..15] ] | y <- [0..7], x <- [0..7] ]
        ds = map (map (map (col . uncurry (pixelAt img)))) seqs
        out = unlines $ map (unlines . map (concatMap show)) ds
      in writeFile "sprite.out" out

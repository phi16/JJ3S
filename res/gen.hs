-- sprite.out generator

import Codec.Picture
import qualified Data.Vector as V
import Data.List
import Numeric

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
col (PixelRGB8 0xcc 0x00 0x00) = 9
col (PixelRGB8 0x77 0x00 0x00) = 10
col (PixelRGB8 0x33 0x00 0x00) = 11
col (PixelRGB8 0x11 0x00 0x00) = 12
col x = error $ show x

hex :: Int -> Char
hex x = head $ showHex x ""

main :: IO ()
main = do
  i' <- readImage "sprite.png"
  case i' of
    Left _ -> putStrLn "Image not found (sprite.png)"
    Right i -> let
        img =   convertRGB8 i
        seqs = [ [ [ (px+x*16, py+y*16) | px <- [0..15] ] | py <- [0..15] ] | y <- [0..7], x <- [0..7] ]
        ds = map (map (map (hex . col . uncurry (pixelAt img)))) seqs
        out = unlines $ map (unlines . map (intersperse ' ')) ds
      in writeFile "sprite.out" out

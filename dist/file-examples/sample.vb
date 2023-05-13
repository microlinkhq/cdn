Function calMax(x, y, z As Variant)

If x > y And x > z Then

calMax = Str(x)
ElseIf y > x And y > z Then
calMax = Str(y)
ElseIf z > x And z > y Then

calMax = Str(z)

End If

End Function

Private Sub Command1_Click()
Dim a, b, c
a = Val(Txt_Num1.Text)
b = Val(Txt_Num2.Text)
c = Val(Txt_Num3.Text)

Lbl_Display.Caption = calMax(a, b, c)

End Sub

Private Sub Label5_Click()

End Sub